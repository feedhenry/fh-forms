var CONSTANTS= require('../../lib/common/constants');
var async = require('async');
var logger = require('../common/logger.js').getLogger();
var getCSVExportStatusCollection = require('./submissionExportHelper/getCSVExportStatusCollection');
var findCSVExportStatus = require('./submissionExportHelper/findCSVExportStatus');

/**
 * module - Starting the export for submissions as CSV. This will register the export task if none exists
 *
 * @param  {object} connections  mongo and mongoose connections
 * @param  {object} options      Mongo connection Options
 * @param  {object} callback
 * @return {type}
 */
module.exports = function startSubmissionCSVExport(connections, options, callback) {

  async.waterfall([
    async.apply(getCSVExportStatusCollection, connections),
    function checkExportInProgress(collection, cb) {
      findCSVExportStatus(connections, function(err, csvExportStatus) {
        if (err) {
          logger.error({error: err}, "Error finding csvExportStatus document");
          return cb(err);
        }

        logger.debug({csvExportStatus: csvExportStatus}, "Find Submission CSV Export Status");

        //If an export is currently in progress, then notify the user.
        if (csvExportStatus && csvExportStatus.status === CONSTANTS.SUBMISSION_CSV_EXPORT.STATUS_INPROGRESS) {
          var msg = "Submission CSV Export already in progress";
          logger.warn({
            csvExportStatus: csvExportStatus
          }, msg);

          return cb(msg);
        }

        //No export currently in progress, can proceed to export the submissions
        return cb(undefined, collection);
      });
    },
    // [db-inspect] submission db update. user data
    function registerSubmissionCSVExport(collection, cb) {
      collection.findOneAndUpdate({}, { $set: {
        status: CONSTANTS.SUBMISSION_CSV_EXPORT.STATUS_INPROGRESS,
        message: "Preparing submission CSV export",
        error: undefined
      }}, {
        upsert: true,
        returnOriginal: false
      }, function(err, updatedCSVStatus) {
        if (err) {
          logger.error({error: err}, "Error updating csvExportStatus document");
        }

        updatedCSVStatus = updatedCSVStatus || {};

        return cb(err, updatedCSVStatus.value);
      });
    }
  ], callback);
};
