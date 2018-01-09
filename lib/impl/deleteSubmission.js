var models = require('../common/models.js')();
var async = require('async');
var MongoFileHandler = require('fh-gridfs').MongoFileHandler;
var logger = require('../common/logger.js').getLogger();
var _ = require('underscore');

var hasGroupId = function(value) {
  return _.has(value, 'groupId');
};

var extractGroupId = function(value) {
  return value.groupId;
};

/**
 * Returns all the `groupId` values for the passed-in submission.
 *
 * A submission can have multiple fields, and each field can have
 * multiple fieldValues.
 */
var extractGroupdIds = function(submission) {
  return _.flatten(submission.formFields.map(function(field) {
    return field.fieldValues.filter(hasGroupId);
  }).map(function(fieldValue) {
    return fieldValue.map(extractGroupId);
  }));
};

/*
 * deleteSubmission(connections, options, appId, cb) *
 *   connections: {
 *     mongooseConnection: ...
 *     databaseConnection: ... *   }
 *
 *   options: {
 *     uri: db connection string,
 *   }
 *   params: {
 *     _id: submission ID of submission to delete
 *   }
 *   cb - callback function (err)
  */
// [db-inspect] reading and then deleting from form submissions
module.exports = function deleteSubmission(connections, options, params, cb) {
  var formSubmissionModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  formSubmissionModel.findOne({"_id" : params._id}).lean().exec(function(err, submission) {
    if (err || !submission) {
      // findOne can return null if no document matched, if so there is no reason to do any
      // further processing. (http://mongoosejs.com/docs/3.8.x/docs/api.html#query_Query-findOne)
      return cb(err);
    } else {
      async.waterfall([
        function(callback) {
          var groupIds = extractGroupdIds(submission);
          logger.debug("Found submission ", submission._id, " to be removed");
          formSubmissionModel.remove({"_id" : submission._id}).exec(function(err) {
            callback(err, groupIds);
          });
        },
        function(groupIds, callback) {
          logger.debug("GroupIds to be deleted: ", groupIds);
          var fileHandler = new MongoFileHandler(options.fileStorage, logger);
          async.eachSeries(groupIds, function(groupId, eachCallback) {
            logger.debug("Processing groupdId", groupId);
            fileHandler.deleteFile(connections.databaseConnection, {"groupId": groupId}, function(err) {
              logger.debug("Deleted file with groupId: ", groupId);
              eachCallback(err);
            });
          }, function(err) {
            callback(err);
          });
        }
      ], function(err) {
        logger.debug("Calling callback [err=" + err + "]");
        return cb(err);
      });
    }
  });
};
