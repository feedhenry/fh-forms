var async = require('async');
var models = require('../common/models.js')();
var _ = require('underscore');
var logger = require('../common/logger.js').getLogger();

// [db-inspect] read appforms from db. user data?
module.exports = function(connections, options, cb) {
  var AppForms = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
  var AppThemes = models.get(connections.mongooseConnection, models.MODELNAMES.APP_THEMES);

  async.parallel({
    projectForms: function(cb) {
      AppForms.find({}).lean().exec(cb);
    },
    projectThemes: function(cb) {
      AppThemes.find({}).lean().exec(cb);
    }
  }, function(err, results) {
    if (err) {
      logger.error("Error Getting Project Theme Config ", {error: err});
      return cb(err);
    }

    var projectForms = results.projectForms || [];
    var projectThemes = results.projectThemes || [];

    projectForms = _.map(projectForms, function(projectForm) {
      var projectTheme = _.find(projectThemes, function(projectTheme) {
        return projectTheme.appId === projectForm.appId;
      });

      if (projectTheme) {
        projectForm.theme = projectTheme.theme;
      }

      return projectForm;
    });

    return cb(undefined, projectForms);
  });
};
