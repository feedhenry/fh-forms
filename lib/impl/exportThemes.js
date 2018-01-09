var models = require('../common/models.js')();

//Exporting all of the themes.
// [db-inspect] read themes from db. user data?
module.exports = function(connections, options, cb) {
  var themeModel = models.get(connections.mongooseConnection, models.MODELNAMES.THEME);

  themeModel.find({}).lean().exec(function(err, allThemes) {
    return cb(err, allThemes || []);
  });
};
