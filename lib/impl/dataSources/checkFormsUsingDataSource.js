var models = require('../../common/models.js')();
var misc = require('../../common/misc.js');
var buildErrorResponse = misc.buildErrorResponse;
var ERROR_CODES = models.CONSTANTS.ERROR_CODES;
var CONSTANTS = require('../../common/constants');
var logger = require('../../common/logger.js').getLogger();

module.exports = function checkFormsUsingDataSource(connections, dataSourceJSON, cb) {
  //Need To List Any Forms That Are Using The Data Source
  logger.debug("checkFormsUsingDataSource ", {dataSourceJSON: dataSourceJSON});
  var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);

  //Only want the JSON definition of the forms, don't need documents
  // [db-inspect] read from db
  Form.find({"dataSources.formDataSources": dataSourceJSON[CONSTANTS.DATA_SOURCE_ID]}).lean().exec(function(err, formsUsingDataSource) {
    if (err) {
      return cb(buildErrorResponse({
        error: err,
        code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
      }));
    }

    logger.debug("checkFormsUsingDataSource ", {formsUsingDataSource: formsUsingDataSource});

    dataSourceJSON.forms = formsUsingDataSource || [];

    //Have All The Information Needed For The Data Source
    return cb(undefined, dataSourceJSON);
  });
};
