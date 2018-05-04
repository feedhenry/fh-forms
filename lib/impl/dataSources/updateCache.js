var models = require('../../common/models.js')();
var validate = require('../../common/validate.js');
var misc = require('../../common/misc.js');
var buildErrorResponse = misc.buildErrorResponse;
var async = require('async');
var _ = require('underscore');
var ERROR_CODES = models.CONSTANTS.ERROR_CODES;
var CONSTANTS = require('../../common/constants');
var processDataSourceResponse = require('./processDataSourceResponse');
var lookUpDataSources = require('./lookupDataSources');
var logger = require('../../common/logger.js').getLogger();


/**
 * Splitting Data Sources Into Invalid And Valid Data Sources.
 * @param dataSourcesToSplit
 * @param currentInvalidDataSources
 * @returns {{valid, invalid: Array}}
 */
function updateValidAndInvalidDataSources(dataSourcesToSplit, currentInvalidDataSources) {
  logger.debug("dataSourcesToSplit", dataSourcesToSplit);
  currentInvalidDataSources = currentInvalidDataSources || [];
  var validInvalid = _.partition(dataSourcesToSplit, function(dataSourceUpdateData) {
    if (dataSourceUpdateData) {
      return !dataSourceUpdateData.error;
    }
  });

  var validDataSources = validInvalid[0];

  //Updating any data sources that are no longer valid
  var invalidDataSources = _.union(validInvalid[1], currentInvalidDataSources);

  return {
    valid: validDataSources,
    invalid: invalidDataSources
  };
}

/**
 * Finding All Data Sources That Need To Be Updated
 * @param dataSources
 * @param connections
 * @param cb
 * @returns {*}
 */
function findDataSources(connections, dataSources, cb) {
  //Just Want The Data Source IDs.
  logger.debug("findDataSources", {dataSources: dataSources});
  var dataSourceIDsToUpdate = _.map(dataSources, function(dataSourceUpdateData) {
    return dataSourceUpdateData.error ? null : dataSourceUpdateData._id;
  });

  dataSourceIDsToUpdate = _.compact(dataSourceIDsToUpdate);

  //No Valid Data Sources To Update. No Need To Search For Data Sources
  if (dataSourceIDsToUpdate.length === 0) {
    return cb(undefined, dataSourceIDsToUpdate);
  }

  var query = {

  };

  //Searching By ID. Just one mongo call to get them all. More Efficient
  query[CONSTANTS.DATA_SOURCE_ID] = {
    "$in": dataSourceIDsToUpdate
  };

  lookUpDataSources(connections, {
    query: query
  }, function(err, foundDataSources) {
    if (err) {
      logger.error("Error Finding Data Sources ", {error: err});
      return cb(buildErrorResponse({
        error: err,
        userDetail: "Unexpected Error When Searching For A Data Source",
        code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
      }));
    }

    //Map Found Data Source Documents
    var dsWithDocuments = _.map(dataSources, function(validDataSource) {
      var matchingDocument = _.find(foundDataSources, function(dataSourceDocument) {
        return _.isEqual(dataSourceDocument._id.toString(), validDataSource._id.toString());
      });

      //If the document is found, assign it to the object, if not, set an error
      if (matchingDocument) {
        validDataSource.document = matchingDocument;
      } else {
        validDataSource.error = buildErrorResponse({
          error: new Error("Data Source Not Found"),
          userDetail: "Data Source Not Found",
          code: ERROR_CODES.FH_FORMS_NOT_FOUND
        });
      }

      return validDataSource;
    });

    var validInvalidDataSources = updateValidAndInvalidDataSources(dsWithDocuments, []);

    logger.debug("findDataSources", {validInvalidDataSources: validInvalidDataSources});

    cb(undefined, validInvalidDataSources.valid, validInvalidDataSources.invalid);
  });
}

/**
 * Validating Data Source Parameters
 * @param dataSources
 * @param cb
 */
function validateParams(dataSources, cb) {
  dataSources = _.map(dataSources, function(dataSourceUpdateData) {
    var failed = validate(dataSourceUpdateData).has(CONSTANTS.DATA_SOURCE_ID);

    if (failed) {
      dataSourceUpdateData.error = buildErrorResponse({error: new Error("Invalid Parameters For Updating Data Source Data Cache"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS});
    }

    if (!misc.checkId(dataSourceUpdateData._id)) {
      dataSourceUpdateData.error = buildErrorResponse({error: new Error("Invalid ID Paramter " + dataSourceUpdateData._id), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS});
    }

    return dataSourceUpdateData;
  });

  //Filter out any data sources with invalid parameters.

  cb(undefined, dataSources);
}

/**
 * Updating All Data Source Caches With New Data Sets Or Errors
 * @param params
 *  - currentTime
 * @param dsWithDocuments
 * @param dsWithNoDocuments
 * @param cb
 */
function updateDataSourceCaches(params, dsWithDocuments, dsWithNoDocuments, cb) {
  //Updating All Of The Data Sources
  //Generating Hashes For The Incoming Data Set. Useful for determining if the stored data set has changed.
  dsWithDocuments = _.map(dsWithDocuments, function(dataSourceData) {
    dataSourceData.dataHash = dataSourceData.error ? null : misc.generateHash(dataSourceData.data);
    return dataSourceData;
  });

  async.map(dsWithDocuments, function(dataSourceWithDocument, cb) {
    return updateDataSourceEntry(params, dataSourceWithDocument, cb);
  }, function(err, updatedDocuments) {

    logger.debug("ARGUMENTS", arguments);
    //Documents are now either updated or failed
    var validInvalidDataSources = updateValidAndInvalidDataSources(updatedDocuments, dsWithNoDocuments);

    return cb(undefined, validInvalidDataSources.valid, validInvalidDataSources.invalid);
  });
}

/**
 * Updating All Forms Associated With Valid Data Source Updates
 * @param params
 *  - currentTime
 *  - connections
 * @param validDataSources
 * @param invalidDataSources
 * @param cb
 */
function updateForms(params, validDataSources, invalidDataSources, cb) {
  //Only interested In Data Sources Where Data Was Actually Updated. If the data set is still the same, then no need to mark the form as updated the form.
  var dataSoucesUpdated = _.filter(validDataSources, function(dataSourceData) {
    return dataSourceData.dataChanged === true;
  });

  //Updating Any Forms That Reference Updated Data Sources
  var updatedDataSourceIds = _.map(dataSoucesUpdated, function(validDataSourceData) {
    return validDataSourceData._id;
  });

  //Need to find and update any forms associated with the data sources.
  var Form = models.get(params.connections.mongooseConnection, models.MODELNAMES.FORM);

  //Flagging Any Forms That Are Using The Updated Data Sources As Being Updated. This is useful for client/cloud apps that need to determine if they need to load the entire form again.
  Form.update({
    "dataSources.formDataSources": {"$in": updatedDataSourceIds}
  }, {
    "$set": {
      "dataSources.lastRefresh": params.currentTime
    }
  }, { multi: true }, function(err) {
    if (err) {
      return cb(buildErrorResponse({
        error: new Error("Error Updating Forms Refresh Fields"),
        code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
      }));
    }

    //No error, forms updated, moving on
    cb(undefined, validDataSources, invalidDataSources);
  });
}

/**
 * Saving The Updated Data Source and Updating The Audit Log.
 * @param params
 * @param params.cacheElement - Cache Element Being Updated
 * @param params.dataSourceDocument - The Mongoose Data Source Document
 * @param params.dataSourceData - The Data Source Data To Be Updated
 * @param params.connections.mongooseConnection - The Mongoose Connection
 * @param callback
 */
function saveAuditLogEntryAndUpdateDataSource(params, callback) {
  var cacheElement = params.cacheElement;
  var dataSourceDocument = params.dataSourceDocument;
  var dataSourceData = params.dataSourceData;

  async.waterfall([
    function saveAuditLog(cb) {
      //An Audit Log Entry Is Based On The Cache Update Entry.
      var auditLogEntry = cacheElement.toJSON();
      //Adding Service Details To The Audit Log Entry
      _.extend(auditLogEntry, _.pick(dataSourceDocument, "serviceGuid", "endpoint"));
      //Adding the audit log
      var AuditLog = models.get(params.connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE_AUDIT_LOG);
      auditLogEntry.dataSource = dataSourceDocument._id;

      var auditLogToSave = new AuditLog(auditLogEntry);

      auditLogToSave.save(function(err, savedAuditLog) {
        if (err) {
          return cb(err);
        }
        dataSourceDocument.auditLogs.push(savedAuditLog);

        return cb();
      });
    },
    function saveDataSource(cb) {

      //Having Attempted To Save, the updated data source has to be validated again to clear old validation errors before trying to save again.
      dataSourceDocument.validate(function() {
        //Data Source Data Is Now valid, can save it - whether it is in an error state or not.
        dataSourceDocument.save(function(err) {
          if (err) {
            dataSourceData.error = buildErrorResponse({
              error: err,
              userDetail: "Unexpected Error When Saving Data Source Data",
              code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
            });

            logger.error("Error Updating Data Source ", {error: dataSourceData.error, dataSourceDocument: dataSourceDocument, cache: dataSourceDocument.cache[0]});

            //Not interested in the document if the save is invalid
            dataSourceData = _.omit(dataSourceData, 'document');

            return cb(undefined, dataSourceData);
          }

          logger.debug("updateDataSourceEntry: Finished Updating Data Source", dataSourceDocument);

          //Save Was Successful, return updated document
          dataSourceData.document = dataSourceDocument;

          return cb(undefined, dataSourceData);
        });
      });

    }
  ], callback);
}

/**
 * Update A Single Data Source Data Entry.
 *
 * @param params
 *  - currentTime
 * @param dataSourceData
 * @param callback
 */
function updateDataSourceEntry(params, dataSourceData, callback) {
  var dataToUpdate = dataSourceData.data;
  var dataSourceDocument = dataSourceData.document;

  logger.debug("updateDataSourceEntry ", params, dataSourceData);

  //If there is no cache entry, create a new one to validate.
  var cacheElement = dataSourceDocument.cache[0];

  if (!cacheElement) {
    dataSourceDocument.cache.push({});
  }

  cacheElement = dataSourceDocument.cache[0];

  //Assigning the last attempt to update the data source
  cacheElement.updateTimestamp = params.currentTime;

  var existingData = cacheElement.data;
  var existingHash = cacheElement.dataHash;

  logger.debug("updateDataSourceEntry ", {dataToUpdate: dataToUpdate, cacheElement: cacheElement, existingData: existingData, existingHash: existingHash});

  if (dataSourceData.dataError || dataSourceData.error) {
    cacheElement.currentStatus = {
      status: "error",
      error: dataSourceData.dataError || dataSourceData.error
    };
  } else if (dataSourceData.dataHash !== cacheElement.dataHash) {
    //If the hashes are different, need to update the data set and hash
    cacheElement.data = dataToUpdate;
    cacheElement.dataHash = dataSourceData.dataHash;
    dataSourceData.dataChanged = true;
  }

  logger.debug("updateDataSourceEntry ", {cacheElementBeforeValidation: cacheElement});

  async.waterfall([
    function validateDataPassed(cb) {
      //Validating That the Data That Was Passed is correct.
      dataSourceDocument.save(function(err) {
        if (err) {
          logger.warn("Error Validating Data Source ", {error: err});
          //Not Valid, don't try to save it, mark it as an error state
          dataSourceData.error = buildErrorResponse({
            error: err,
            userDetail: "Invalid Data For Cache Update.",
            systemDetail: err.message,
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          });

          //If there is a validation error, save it with the exiting data set Data Source for viewing later.
          cacheElement.data = existingData ? existingData : [];
          cacheElement.dataHash = existingHash;
          cacheElement.currentStatus = {
            status: "error",
            error: dataSourceData.error
          };
        }

        if (!dataSourceData.error && !dataSourceData.dataError) {
          //marking the status as ok.
          cacheElement.currentStatus = {
            status: "ok",
            error: null
          };
          //Resetting the backOffIndex as it is a valid Data Source update.
          cacheElement.backOffIndex = 0;
          cacheElement.markModified('currentStatus');
        } else {
          //The data source encountered an error. Increment the backOffIndex.
          cacheElement.backOffIndex = cacheElement.backOffIndex ? cacheElement.backOffIndex + 1 : 1;
        }

        //Mark The Submission As Refreshed
        cacheElement.lastRefreshed = params.currentTime;

        logger.debug("updateDataSourceEntry ", {cacheElementAfterValidate: cacheElement});

        cb();
      });
    },
    async.apply(saveAuditLogEntryAndUpdateDataSource, _.extend({
      cacheElement: cacheElement,
      dataSourceDocument: dataSourceDocument,
      dataSourceData: dataSourceData
    }, params))
  ], callback);
}

/**
 * Preparing The JSON Response For The Data Source Cache Update.
 * @param validDataSources
 * @param invalidDataSources
 * @param cb
 * @returns {*}
 */
function prepareResponse(validDataSources, invalidDataSources, cb) {
  //There Were Errors Updating Data Sources, should return an error

  logger.debug("prepareResponse Before", validDataSources);
  //For The Valid Data Sources, Just want the updated Document JSON
  validDataSources = _.map(validDataSources, function(validDataSourceData) {
    return processDataSourceResponse(validDataSourceData.document.toJSON());
  });

  logger.debug("prepareResponse After", validDataSources);

  var returnError;
  if (invalidDataSources.length > 0) {
    returnError = buildErrorResponse({
      error: new Error("Error Updating Data Sources"),
      code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
    });
  }

  return cb(returnError, {
    validDataSourceUpdates: validDataSources,
    invalidDataSourceUpdates: invalidDataSources
  });
}

/**
 * Updating The Data Cache Of A Data Source.
 * @param connections
 * @param dataSources
 * @param params
 *  - currentTime: A Time Stamp Representing The Data Source Update Time
 * @param cb
 */
module.exports = function updateCache(connections, dataSources, params, cb) {
  logger.debug("updateCache", dataSources, params);
  //Data Sources Should Be An Array
  if (!(_.isArray(dataSources))) {
    return cb(buildErrorResponse({error: new Error("Invalid Data Sources Object To Update. Must Be An Array"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  if (!params.currentTime) {
    return cb(buildErrorResponse({error: new Error("Expected a Current Time Parameter To Be Set"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  async.waterfall([
    async.apply(validateParams, dataSources),
    async.apply(findDataSources, connections),
    async.apply(updateDataSourceCaches, _.extend({connections: connections}, params)),
    async.apply(updateForms, _.extend({connections: connections}, params)),
    prepareResponse
  ], cb);
};
