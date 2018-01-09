var models = require('../../common/models.js')();


/**
 *
 * @param connections
 * @param {object}  params
 * @param {boolean} params.includeAuditLog - flag on whether to include audit logs or not.
 * @param {boolean} params.includeAuditLogData: flag for including the data set with the audit log list.
 * @param {boolean} params.lean - Flag On Whether To Include Documents or raw JSON
 * @param {object} params.query - Query To Execute
 *
 * @param cb
 * @returns {*}
 */
module.exports = function lookUpDataSources(connections, params, cb) {
  if (!params) {
    return cb(new Error("No Search Parameters For Finding Data Sources"));
  }

  //Some queries don't want a document, just want a Javascript Object.
  var lean = params.lean ? params.lean : false;

  var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);

  var queryToExecute = DataSource.find(params.query);

  //Only want to populate audit logs if needed. Needless overhead otherwise
  if (params.includeAuditLog && params.includeAuditLogData) {
    queryToExecute.populate('auditLogs');
  } else if (params.includeAuditLog) {
    queryToExecute.populate('auditLogs', '-data');
  }

  //Looking To Find A Data Source -- Using lean if just want an Object instead of a document
  // [db-inspect] read from data source db
  queryToExecute.lean(lean).exec(function(err, dataSources) {
    if (err) {
      return cb(err);
    }

    return cb(undefined, dataSources);
  });
};
