var models = require('../common/models.js')();
var async = require('async');
var _ = require('underscore');

// [db-inspect] update of theme data to db. user data?
module.exports = function(connections, options, themes, cb) {
  var Theme = models.get(connections.mongooseConnection, models.MODELNAMES.THEME);

  async.each(themes, function(theme, cb) {
    Theme.findOneAndUpdate({_id: theme._id}, _.omit(theme, "_id"), {upsert: true}, cb);
  }, cb);
};
