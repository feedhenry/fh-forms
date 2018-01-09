var logfns = require('../common/logger.js');
var logger = logfns.getLogger();
var mongoUriParser = require('mongodb-uri');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;

/**
 * Get the database name from the given mongodb uri.
 * @param {string} uri the mongodb uri
 * @returns {string} the name of the mongodb database
 */
function getDbName(uri) {
  var parsedMongooseUri = mongoUriParser.parse(uri);
  var dbName = parsedMongooseUri.database;
  return dbName;
}

/**
 * Get a new mongoose connection instance. Will reuse an existing mongoose connection if it's passed in (this connection should be authenticated already and have access to the target db. E.g. admin user).
 * Otherwise a new mongoose connection (connection pool) will be created.
 * @param {string} url the uri of the mongodb
 * @param {object} mongooseConnection an existing mongoose connection. If exists, it will be resued for the mongoose connection
 * @param {function} cb the callback function
 */
 // [db-inspect] getting the mongoose connection
function getMongooseConnection(uri, mongooseConnection, cb) {
  logger.debug("getting mongoose connection");
  var mongooseConn;
  if (mongooseConnection && typeof mongooseConnection.useDb === 'function') {
    process.nextTick(function() {
      logger.debug("creating the mongoose connection using the existing connection", {uri: uri});
      var dbName = getDbName(uri);
      mongooseConn = mongooseConnection.useDb(dbName);
      return cb(undefined, mongooseConn);
    });
  } else {
    process.nextTick(function() {
      logger.warn("creating a new mongoose connection", {uri: uri});
      mongooseConn = mongoose.createConnection(uri);
      return cb(undefined, mongooseConn);
    });
  }
}

/**
 * Get a new mongodb connection instance. Will reuse an existing mongodb connection if it's passed in (this connection should be authenticated already and have access to the target db. E.g. admin user).
 * Otherwise a new mongodb connection (connection pool) will be created.
 * @param {string} url the uri of the mongodb
 * @param {object} mongodbConnection an existing mongodb connection. If exists, it will be resued for the mongodb connection
 * @param {function} cb the callback function
 */
function getMongoConnection(uri, mongodbConnection, cb) {
  logger.debug("getting mongodb connection");
  var mongoConn;
  if (mongodbConnection && typeof mongodbConnection.db === 'function') {
    process.nextTick(function() {
      logger.debug("creating the mongodb connection using the existing connection", {uri: uri});
      var dbName = getDbName(uri);
      mongoConn = mongodbConnection.db(dbName);
      return cb(undefined, mongoConn);
    });
  } else {
    logger.warn("creating a new mongodb connection", {uri: uri});
    // [db-inspect] connection to the db
    return MongoClient.connect(uri, logger.ensureRequestId ? logger.ensureRequestId(cb) : cb);
  }
}

module.exports = {
  getMongoConnection: getMongoConnection,
  getMongooseConnection: getMongooseConnection
};
