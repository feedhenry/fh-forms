var mongoUrlParser = require('mongodb-uri');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var MONGODB_DEFAULT_POOL_SIZE = 20;

/**
 * Get the url of the mongodb database that will the given formUser to connect.
 * @param {string} mongoConnectionString a mongodb url that should at least contain the mongodb hosts
 * @param {object} formUser a mongodb user that should have the "readWriteAnyDatabase" role to access any database. This type of user should exist in the mongo `admin` database.
 * @param {string} formUser.user the username
 * @param {string} formUser.pass the user password
 * @param {int} poolSize the poolSize of the mongodb connection. Default to 20.
 * @return {string} the mongodb connection url
 */
function getAdminDbUrl(mongoConnectionString, formUser, poolSize) {
  var parsedMongoUrl = mongoUrlParser.parse(mongoConnectionString);
  parsedMongoUrl.username = formUser.user;
  parsedMongoUrl.password = formUser.pass;
  //according to this: https://docs.mongodb.com/v2.4/reference/user-privileges/#any-database-roles, this type of user should be created in the `admin` database.
  parsedMongoUrl.database = "admin";
  parsedMongoUrl.options = parsedMongoUrl.options || {};
  parsedMongoUrl.options.poolSize = poolSize || MONGODB_DEFAULT_POOL_SIZE;
  var mongourl = mongoUrlParser.format(parsedMongoUrl);
  return mongourl;
}

/**
 * Create a new mongodb connection.
 * @param {string} mongoDbUrl the url to connect to the mongodb database
 * @param {object} logger
 * @param {function} cb the callback function
 */
function getMongodbConnection(mongoDbUrl, logger, cb) {
  logger.debug("creating mongodb connection for data_source_update job", {mongoDbUrl: mongoDbUrl});
  // [db-inspect] connect to the db
  MongoClient.connect(mongoDbUrl, cb);
}

/**
 * Create a new mongoose connection.
 * @param {string} mongoDbUrl the url to connect to the mongodb database
 * @param {object} logger
 * @param {function} cb the callback function
 */
function getMongooseConnection(mongoDbUrl, logger, cb) {
  logger.debug("creating mongoose connection for data_source_update job", {mongoDbUrl: mongoDbUrl});
  // [db-inspect] creating the mongoose connection
  var mongooseConnection = mongoose.createConnection(mongoDbUrl);
  return cb(undefined, mongooseConnection);
}

/**
 * Setup new mongodb and mongoose connections to the given database.
 * @param {object} logger
 * @param {string} mongoConnectionString  the mongodb connection string
 * @param {object} config the configuration object
 * @param {object} config.auth the form user authentication details
 * @param {string} config.auth.user the form user name
 * @param {string} config.auth.pass the form user pass
 * @param {int} config.poolSize the mongodb connection poolSize config
 * @param {function} cb the callback function
 */
// [db-inspect] connection to the admin db
module.exports = function(logger, mongoConnectionString, config, cb) {
  logger.debug("setup mongodb connections", {mongoConnectionString: mongoConnectionString, config: config});
  var mongoDbUrl = getAdminDbUrl(mongoConnectionString, config.auth, config.poolSize);
  logger.debug("formated mongo connection url", {mongoDbUrl: mongoDbUrl});
  async.series({
    mongoConnection: async.apply(getMongodbConnection, mongoDbUrl, logger),
    mongooseConnection: async.apply(getMongooseConnection, mongoDbUrl, logger)
  }, function(err, connections) {
    if (err) {
      logger.error("Failed to setup db connection", {error: err});
      return cb(err);
    }
    return cb(undefined, {
      mongodbConnection: connections.mongoConnection,
      mongooseConnection: connections.mongooseConnection
    });
  });
};
