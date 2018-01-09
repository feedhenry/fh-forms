var models = require('../common/models.js')();
var logger = require('../common/logger.js').getLogger();

// [db-inspect] read app config from db. user data?
module.exports = function(connections, options, cb) {
  logger.debug("Exporting App Config");
  var conn = connections.mongooseConnection;
  var AppConfig = models.get(conn, models.MODELNAMES.APP_CONFIG);

  AppConfig.find({}).lean().exec(cb);
};
