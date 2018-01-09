var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var CONSTANTS = require('../constants');
var _ = require('underscore');

var dsCacheAuditLog = require('./dataSourceCache');

//There should only ever be at most one cache entry.
function cacheValidator(cacheArray) {
  return cacheArray.length <= 1;
}

var defaults = {
  refreshIntervalMin: 1,
  refreshIntervalMax: 10080
};

module.exports = function(config) {
  var dataSourceSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    lastUpdated: {type : Date, default : Date.now, required: true},
    dateCreated: {type : Date, default : Date.now, required: true},
    updatedBy : {type: String, required: true},
    createdBy: {type:String, required: true},
    endpoint: {type: String, required: true},
    refreshInterval: {type: Number, required: true, min: config.refreshIntervalMin || defaults.refreshIntervalMin, max: config.refreshIntervalMax || defaults.refreshIntervalMax},
    serviceGuid: {type: String, required: true},
    cache: [dsCacheAuditLog.dataSourceCacheEntry()],
    numAuditLogEntries: {type: Number, required: true, min: 10, default: 1000},
    auditLogs: [{ type: Schema.Types.ObjectId, ref: CONSTANTS.MODELNAMES.DATA_SOURCE_AUDIT_LOG }]
  }, CONSTANTS.SCHEMA_OPTIONS);


  //Pruning out any unnecessary audit logs before saving the data source.
  //Removing older ones first
  dataSourceSchema.pre('save', function(next) {
    var numInvalidAuditLogs = this.auditLogs.length - this.numAuditLogEntries;
    var AuditLog = this.model(CONSTANTS.MODELNAMES.DATA_SOURCE_AUDIT_LOG);

    var auditLogsToRemove = [];
    if (numInvalidAuditLogs > 0) {
      auditLogsToRemove = this.auditLogs.splice(0, numInvalidAuditLogs);
      this.markModified('auditLogs');
    }

    //Cleaning Up Audit Logs
    if (_.first(auditLogsToRemove)) {
      AuditLog.find({_id: {'$in': auditLogsToRemove}}).remove(next);
    } else {
      next();
    }
  });

  /**
   * Clearing Audit Logs Associated With A Data Source.
   * @param id
   * @param cb
   */
  // [db-inspect] remove function
  // it looks like a system call to remove audit logs that the user would not be interested in
  dataSourceSchema.statics.clearAuditLogs = function(id, cb) {
    var AuditLog = this.model(CONSTANTS.MODELNAMES.DATA_SOURCE_AUDIT_LOG);
    AuditLog.find({dataSource: id}).remove(cb);
  };

  dataSourceSchema.path('cache').validate(cacheValidator, 'Data Cache Is Invalid');
  return dataSourceSchema;
};