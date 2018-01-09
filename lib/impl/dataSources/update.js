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
var checkFormsUsingDataSource = require('./checkFormsUsingDataSource');

/**
 * validateParams - Validating A Data Source For Update. Should Have A _id parameter and no Data Set.
 *
 * @param  {object} dataSource Data Source To Update
 * @param  {function} cb       Callback
 * @return {undefined}
 */
function validateParams(dataSource, cb) {
  var dataSourceValidator = validate(dataSource);
  //The data source parameter should have an ID property.
  dataSourceValidator.has(CONSTANTS.DATA_SOURCE_ID, function(err) {
    if (err) {
      return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Update A Data Source"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
    }

    //Data Source Cache Should Not Be Updated With This Function
    dataSourceValidator.hasno(CONSTANTS.DATA_SOURCE_DATA, CONSTANTS.DATA_SOURCE_CACHE, function() {
      if (err) {
        return cb(buildErrorResponse({error: new Error("Updating A Data Source Should Not Include Cache Data"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
      }

      cb(undefined, dataSource);
    });
  });
}


/**
 * findDataSource - Finding A Data Source
 *
 * @param  {object} connections Mongoose And Mongo Connections
 * @param  {object} dataSource  Data Source To Update
 * @param  {function} cb          Callback
 * @return {undefined}
 */
function findDataSource(connections, dataSource, cb) {
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

    //Should only be one data source
    if (dataSources.length !== 1) {
      return cb(buildErrorResponse({
        error: new Error("Data Source Not Found"),
        systemDetail: "Requested ID: "  + dataSource[CONSTANTS.DATA_SOURCE_ID],
        code: ERROR_CODES.FH_FORMS_NOT_FOUND
      }));
    }

    return cb(undefined, dataSource, dataSources[0]);
  });
}

/**
 * update - Updating A Data Source
 *
 * @param  {object} connections Mongoose And Mongo Connections
 * @param  {object} dataSource  Data Source Data To Update
 * @param  {function} callback  callback Function
 * @return {undefined}
 */
module.exports = function update(connections, dataSource, callback) {
  async.waterfall([
    async.apply(validateParams, dataSource),
    async.apply(findDataSource, connections),
    function validateNameNotUsed(dataSourceJSON, dataSourceDocument, cb) {
      //Duplicate Names Are Not Allowed.
      var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);

      //The same name is ok if the data source is the same one.
      DataSource.count({name: dataSource.name, _id: {"$ne": dataSourceJSON._id}}, function(err, numDuplicateDSs) {
        if (numDuplicateDSs && numDuplicateDSs > 0) {
          return cb({
            userDetail: "Invalid Data To Update A Data Source" ,
            systemDetail: "A Data Source With The Name " + dataSource.name + " Alread Exists",
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          });
        } else {
          return cb(err, dataSource, dataSourceDocument);
        }
      });
    },
    function updateDataSource(dataSourceJSON, dataSourceDocument, cb) {
      //Updating The Data Source Document.

      //The Data Source shout not contain any functions.
      dataSourceJSON = misc.sanitiseJSON(dataSourceJSON);

      //Can't update the docuemnt ID field.
      dataSourceJSON = _.omit(dataSourceJSON, CONSTANTS.DATA_SOURCE_ID);

      dataSourceDocument = _.extend(dataSourceDocument, dataSourceJSON);

      //Marking The Data Source As Having Been Updated
      dataSourceDocument.lastUpdated = new Date();
      // [db-inspect] write to db
      dataSourceDocument.save(function(err) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Invalid Data Source Update Data.",
            systemDetail: err.errors,
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          }));
        }

        dataSourceDocument = processDataSourceResponse(dataSourceDocument.toJSON());

        return cb(undefined, dataSourceDocument);
      });
    },
    function checkForms(dataSourceJSON, cb) {
      //Checking For Any Forms Associated With The Data Source
      checkFormsUsingDataSource(connections, dataSourceJSON, cb);
    }
  ], callback);
};
