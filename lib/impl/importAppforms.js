var models = require('../common/models.js')();
var async = require('async');
var _ = require("underscore");


/**
 * Import Appforms And Theme Associated With A Project
 * @param connections
 * @param options
 * @param appFormsThemesToImport
 * @param cb
 */
// [db-inspect] multiple updates od app forms data to db. user data?
module.exports = function(connections, options, appFormsThemesToImport, cb) {
  var AppForms = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
  var AppThemes = models.get(connections.mongooseConnection, models.MODELNAMES.APP_THEMES);

  //Bulk Import Of Form Project and  Theme Project associations
  var appForms = _.map(appFormsThemesToImport, function(appFormThemeConfig) {
    return _.omit(appFormThemeConfig, "theme");
  });

  var appThemes = _.map(appFormsThemesToImport, function(appFormThemeConfig) {
    return _.pick(appFormThemeConfig, "appId", "theme");
  });

  async.parallel([
    function(cb) {
      async.each(appForms, function(appForm, cb) {
        AppForms.findOneAndUpdate({_id: appForm._id}, _.omit(appForm, "_id"), {upsert: true}, cb);
      }, cb);
    },
    function(cb) {
      async.each(appThemes, function(appTheme, cb) {
        AppThemes.findOneAndUpdate({_id: appTheme._id}, _.omit(appTheme, "_id"), {upsert: true}, cb);
      }, cb);
    }
  ], function(err) {
    return cb(err);
  });
};
