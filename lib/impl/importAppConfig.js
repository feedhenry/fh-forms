var async = require('async');
var models = require('../common/models.js')();
var _ = require('underscore');
var logger = require('../common/logger.js').getLogger();

// [db-inspect] update of record in app config db. user data
module.exports = function(connections, options, appConfigToUpdate, cb) {
  logger.debug("Importing App Config", {appConfigToUpdate: appConfigToUpdate});

  var AppConfig = models.get(connections.mongooseConnection, models.MODELNAMES.APP_CONFIG);

  async.map(appConfigToUpdate, function(appConfig, cb) {
    AppConfig.findOneAndUpdate({appId : appConfig.appId}, _.omit(appConfig, "appId", "_id"), {upsert: true, new: true}, cb);
  }, cb);
};
