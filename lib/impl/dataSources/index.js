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
var checkUpdateInterval = require('./checkUpdateInterval');

var update = require('./update');
var checkFormsUsingDataSource = require('./checkFormsUsingDataSource');

/**
 * Get A Specific Data Source Definition
 * @param connections
 * @param params
 * @param params._id: Data Source Id
*  @param params.includeAuditLog: flag to include a data source audit log or not.
*  @param params.includeAuditLogData: flag for including the data set with the audit log list.
 * @param cb
 */
function get(connections, params, cb) {
  //validateParams
  //LookUpDataSource
  //CheckFormsThatAre Using The Data Source
  //Return Result.

  async.waterfall([
    function validateParams(cb) {
      validate(params).has(CONSTANTS.DATA_SOURCE_ID, function(err) {
        if (err) {
          return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Get A Data Source"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
        }

        return cb(undefined, params[CONSTANTS.DATA_SOURCE_ID]);
      });
    },
    function findDataSources(id, cb) {
      var query = {

      };

      //Searching By ID.
      query[CONSTANTS.DATA_SOURCE_ID] = id;

      lookUpDataSources(connections, {
        query: query,
        lean: true,
        includeAuditLog: params.includeAuditLog,
        includeAuditLogData: params.includeAuditLogData
      }, function(err, dataSources) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Searching For A Data Source",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        //Checking if the data source exists. Should be only one
        if (dataSources.length !== 1) {
          return cb(buildErrorResponse({
            error: new Error("Data Source Not Found"),
            systemDetail: "Requested ID: "  + params[CONSTANTS.DATA_SOURCE_ID],
            code: ERROR_CODES.FH_FORMS_NOT_FOUND
          }));
        }

        var dataSourceJSON = dataSources[0];
        dataSourceJSON = processDataSourceResponse(dataSourceJSON, {
          includeAuditLog: params.includeAuditLog
        });

        return cb(undefined, dataSourceJSON);
      });
    },
    function checkForms(dataSourceJSON, cb) {
      //Checking For Any Forms Associated With The Data Source
      checkFormsUsingDataSource(connections, dataSourceJSON, cb);
    }
  ], cb);
}

/**
 * Listing All Data Sources. In The Environment, this will include the current cache data.
 * @param connections
 * @param params
 *  - listDataSourcesNeedingUpdate: Flag For Only Returning Data Sources That Require An Update
 *  - currentTime: Time Stamp To Compare Data Source Last Updated Timestamps To
 * @param callback
 */
function list(connections, params, callback) {

  logger.debug("Listing Data Sources", params);

  var currentTime = new Date(params.currentTime);
  //If listing data sources needing a cache update, need to supply a valid date.
  if (params.listDataSourcesNeedingUpdate && !params.currentTime && currentTime.toString() !== "Invalid Date") {
    return callback(buildErrorResponse({error: new Error("An currentTime Date Object Is Required To List Data Sources Requiring Update"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  async.waterfall([
    function findDataSources(cb) {
      var query = {};

      lookUpDataSources(connections, {
        query: query,
        lean: true
      }, function(err, dataSources) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Searching For A Data Source",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        logger.debug("Listing Data Sources", {dataSources: dataSources});

        //Only return Data Sources with a valid data source update time
        if (params.listDataSourcesNeedingUpdate) {
          dataSources = checkUpdateInterval(dataSources, currentTime);
        }

        logger.debug("Listing Data Sources", {dataSourceAfterFilter: dataSources});

        dataSources = _.map(dataSources, processDataSourceResponse);

        return cb(undefined, dataSources);
      });
    },
    function getFormsUsingDataSources(dataSources, cb) {
      async.map(dataSources, function(dataSource, cb) {
        checkFormsUsingDataSource(connections, dataSource, cb);
      }, cb);
    }
  ], callback);
}

/**
 * Creating A New Data Source
 * @param connections
 * @param dataSource
 * @param callback
 */
function create(connections, dataSource, callback) {
  async.waterfall([
    function validateParams(cb) {

      //If it is a deploy, the JSON can contain an _id param
      if (connections.deploy) {
        return cb(undefined, dataSource);
      }

      //Otherwise, check that it is not there.
      validate(dataSource).hasno(CONSTANTS.DATA_SOURCE_ID, function(err) {
        if (err) {
          return cb(buildErrorResponse({error: new Error("Data Source ID Should Not Be Included When Creating A Data Source"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
        }

        cb(undefined, dataSource);
      });
    },
    // [db-inspect] multiple reads from db
    function validateNameNotUsed(dataSource, cb) {
      //Duplicate Names Are Not Allowed.
      var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);

      DataSource.count({name: dataSource.name}, function(err, numDuplicateDSs) {
        if (numDuplicateDSs && numDuplicateDSs > 0) {
          return cb({
            userDetail: "Invalid Data To Create A Data Source" ,
            systemDetail: "A Data Source With The Name " + dataSource.name + " Already Exists",
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          });
        } else {
          return cb(err, dataSource);
        }
      });
    },
    function createDataSource(dataSourceJSON, cb) {
      dataSourceJSON = misc.sanitiseJSON(dataSourceJSON);

      var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);
      var newDataSource = new DataSource(dataSourceJSON);

      newDataSource.save(function(err) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Invalid Data Source Creation Data.",
            systemDetail: err.errors,
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          }));
        }

        newDataSource = processDataSourceResponse(newDataSource.toJSON());

        return cb(undefined, newDataSource);
      });

    }
  ], callback);
}

/**
 * Removing A Data Source
 * @param connections
 * @param params
 * @param cb
 */
// [db-inspect] multiple reads and a delete from db
function remove(connections, params, cb) {
  var failed = validate(params).has(CONSTANTS.DATA_SOURCE_ID);

  if (failed) {
    return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Remove A Data Source"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  if (!misc.checkId(params[CONSTANTS.DATA_SOURCE_ID])) {
    return cb(buildErrorResponse({error: new Error("Invalid ID Parameter"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }
  var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);

  async.waterfall([
    function findAssociatedForms(cb) {
      checkFormsUsingDataSource(connections, params, cb);
    },
    function verifyNoFormsAssociated(updatedDataSource, cb) {
      //If there are any forms using this data source, then do not delete it.
      logger.debug("Remove Data Source ", {updatedDataSource: updatedDataSource});

      if (updatedDataSource.forms.length > 0) {
        return cb(buildErrorResponse({
          error: new Error("Forms Are Associated With This Data Source. Please Disassociate Forms From This Data Source Before Deleting."),
          code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
        }));
      }

      return cb(undefined, updatedDataSource);
    },
    function processResponse(updatedDataSource, cb) {
      //Removing The Data Source

      DataSource.remove({_id: updatedDataSource._id}, function(err) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Removing A Data Source",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        //Data Source Removed Successfully
        return cb(undefined, updatedDataSource);
      });
    },
    function removeAduditLogs(updatedDataSource, cb) {
      DataSource.clearAuditLogs(updatedDataSource._id, cb);
    }
  ], cb);
}



/**
 * Validating A Data Source Object.
 * @param connections
 * @param dataSource
 * @param cb
 */
function validateDataSource(connections, dataSource, cb) {
  var dataSourceToValidate = _.clone(dataSource);
  var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);

  //Expect The Data Source To Have Data
  var failure = validate(dataSourceToValidate).has(CONSTANTS.DATA_SOURCE_DATA);

  if (failure) {
    return cb(buildErrorResponse({
      error: new Error("No Data Passed To Validate"),
      code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
    }));
  }

  //Generate A Hash
  var hash = misc.generateHash(dataSourceToValidate.data);

  //Populate A Cache Object
  //LastRefreshed is populated just for the cache mongoose schema
  var cache = {
    dataHash: hash,
    currentStatus: {
      status: "ok"
    },
    data: dataSourceToValidate.data,
    lastRefreshed: new Date().getTime(),
    updateTimestamp: new Date().getTime()
  };

  dataSourceToValidate.cache = [cache];

  //Create A New Mongoose. Note that this document is never saved. It is useful for consistent validation
  var testDataSource = new DataSource(dataSourceToValidate);
  //Validating Without Saving
  testDataSource.validate(function(err) {
    var valid = err ? false : true;
    var dataSourceJSON = testDataSource.toJSON();

    dataSourceJSON = processDataSourceResponse(dataSourceJSON);

    dataSourceJSON = _.omit(dataSourceJSON, "lastRefreshed", "currentStatus", "updateTimestamp", CONSTANTS.DATA_SOURCE_ID);

    dataSourceJSON.validationResult = {
      valid: valid,
      message: valid ? "Data Source Is Valid" : "Invalid Data Source Update Data."
    };

    return cb(undefined, dataSourceJSON);
  });
}

/**
 * Deploying A Data Source. Check If It Exists First, then update, if not create it.
 */
function deploy(connections, dataSource, cb) {

  async.waterfall([
    function validateParams(cb) {
      var dataSourceValidator = validate(dataSource);
      //The data source parameter should have an ID property.
      dataSourceValidator.has(CONSTANTS.DATA_SOURCE_ID, function(err) {
        if (err) {
          return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Deploy A Data Source"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
        }

        cb(undefined, dataSource);
      });
    },
    function findDataSource(dataSource, cb) {
      var query = {

      };

      //Searching By ID.
      query[CONSTANTS.DATA_SOURCE_ID] = dataSource[CONSTANTS.DATA_SOURCE_ID];

      //Looking up a full data source document as we are updating
      lookUpDataSources(connections, {
        query: query,
        lean: false
      }, function(err, dataSources) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Searching For A Data Source",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        //If no data sources found create, otherwise update.
        if (dataSources.length === 0) {
          connections.deploy = true;
          create(connections, dataSource, cb);
        } else {
          update(connections, dataSource, cb);
        }
      });
    }
  ], cb);
}

module.exports = {
  get: get,
  list: list,
  update: update,
  create: create,
  updateCache: require('./updateCache'),
  validate: validateDataSource,
  deploy: deploy,
  remove: remove,
  getAuditLogEntry: require('./getAuditLogEntry')
};
