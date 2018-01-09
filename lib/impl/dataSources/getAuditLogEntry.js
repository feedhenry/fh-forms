var models = require('../../common/models.js')();
var misc = require('../../common/misc.js');
var buildErrorResponse = misc.buildErrorResponse;


/**
 * Getting A Single Audit Log Entry. Including Data
 * @param connections - Mongoose Connection
 * @param mongooseConnection - Mongoose Connection
 * @param {object} params
 * @param {string} params._id - ID Of The Audit Log.
 * @param {string} params.dataSource - ID Of The Data Source.
 * @param cb
 * @returns {*}
 */
module.exports = function getAuditLogEntry(connections, params, cb) {
  var DataSourceAuditLog = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE_AUDIT_LOG);

  if (!params._id) {
    return cb(buildErrorResponse({error: new Error("Expected an _id parameter when searching for an audit log. ")}));
  }
  // [db-inspect] read from data source db
  DataSourceAuditLog.findOne({_id: params._id}).lean(true).exec(cb);
};
