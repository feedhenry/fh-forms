var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var fhgridfs = require("fh-gridfs").MongoFileHandler;
var async = require("async");
var fs = require("fs");
var mime = require("mime");
var _ = require('underscore');
var logger = require('../common/logger.js').getLogger();

var updateSubmissionFile = function(connections, options, cb) {

  logger.debug("FH-FORMS: updateSubmissionFile", {options: options});

  var submissionToUpdate;
  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var fileSavedResult;
  var fileHandler = new fhgridfs();

  options = options || {};

  //If adding a new submission file, find the field values and append.
  var addingNewSubmissionFile = options.addingNewSubmissionFile;

  var submission = options.submission || {};
  var fileDetails = options.fileDetails || {};
  var subFileDetails = _.pick(fileDetails, "fileName", "hashName", "fileType", "fileSize");
  var foundFileEntry = subFileDetails;

  async.series([validateParams, findSubmission, findPlaceholder, saveFileStream, deleteOldFile, updateSubmission], function(err) {
    if (err) {
      return cb(err);
    }

    var resultJSON = {};
    resultJSON.status = 200;
    return cb(undefined, resultJSON);
  });

  function validateParams(cb) {
    logger.debug("FH-FORMS: updateSubmissionFile validateParams", {fileDetails: fileDetails, submission: submission});
    var validateSubmissionDetails = validate(submission);
    var validateFileDetails = validate(fileDetails);

    validateSubmissionDetails.has("fieldId", "submissionId", function(failed) {
      if (failed) {
        logger.error("FH-FORMS: updateSubmissionFile validateParams", {failed: failed});
        return cb(new Error("Invalid params to updateSubmissionFile " + JSON.stringify(failed)));
      }

      validateFileDetails.has("fileName", "fileType", "fileSize", "fileStream", function(failed) {
        if (failed) {
          logger.error("FH-FORMS: updateSubmissionFile validateParams", {failed: failed});
          return cb(new Error("Invalid file params to updateSubmissionFile" + JSON.stringify(failed)));
        }

        return cb();
      });
    });
  }

  function findSubmission(cb) {

    logger.debug("FH-FORMS: updateSubmissionFile findSubmission", {submissionId: submission.submissionId});

    FormSubmission.findOne({"_id": submission.submissionId}, function(err, foundSubmission) {
      if (err) {
        logger.error("FH-FORMS: updateSubmissionFile findSubmission", {error: err});
        return cb(err);
      }

      if (foundSubmission === null) {
        var error = new Error("No submission matching ID: " + submission.submissionId);
        logger.error("FH-FORMS: updateSubmissionFile findSubmission", {error: error});
        return cb(error);
      }

      submissionToUpdate = foundSubmission;

      return cb();
    });
  }

  function findPlaceholder(cb) {

    logger.debug("FH-FORMS: updateSubmissionFile findPlaceholder", {addingNewSubmissionFile: addingNewSubmissionFile});

    //If adding a new file, don't expect it to exist
    if (addingNewSubmissionFile) {
      return cb();
    }

    var foundFieldsToUpdate = _.filter(submissionToUpdate.formFields, function(formField) {
      return formField.fieldId.toString() === submission.fieldId.toString();
    });

    if (foundFieldsToUpdate.length === 0) {
      return cb(new Error("No field with id " + submission.fieldId + " exists in submission with id " + submission.submissionId));
    }

    //Find the file entry by groupId
    foundFileEntry = undefined;
    foundFieldsToUpdate.forEach(function(formField) {
      var found = _.find(formField.fieldValues, function(fieldValue) {
        return fieldValue.groupId.toString() === fileDetails.groupId.toString();
      });
      if (found) {
        foundFileEntry = found;
      }
    });

    if (!foundFileEntry) {
      var error = new Error("No file with id " + fileDetails.groupId + " exists in the submission with id " + submission.submissionId);
      logger.error("FH-FORMS: updateSubmissionFile findPlaceholder", {error: error});
      return cb(error);
    }

    return cb();
  }

  function saveFileStream(cb) {
    //Path to the file is passed, create a read stream
    logger.debug("FH-FORMS: updateSubmissionFile saveFileStream", {fileStream: fileDetails.fileStream});
    var submittedFileStream = fs.createReadStream(fileDetails.fileStream);
    submittedFileStream.pause();

    var fileNameToSave = fileDetails.fileName;

    var fileExtension = mime.extension(fileDetails.fileType);

    if (fileNameToSave.indexOf("." + fileExtension) === -1) {
      fileNameToSave += "." + fileExtension;
    }

    var saveFileOptions = addingNewSubmissionFile ? {} : {"groupId" : fileDetails.groupId};

    if (submission.decodeBase64) {
      saveFileOptions.decodeBase64 = true;
    }

    logger.debug("FH-FORMS: updateSubmissionFile saveFileStream", {fileNameToSave: fileNameToSave, saveFileOptions: saveFileOptions});

    fileHandler.saveFile(connections.databaseConnection, fileNameToSave , submittedFileStream, saveFileOptions, function(err, saveResult) {
      if (err) {
        logger.error("FH-FORMS: updateSubmissionFile saveFileStream", {error: err});
        return cb(err);
      }

      fileSavedResult = saveResult;

      logger.debug("FH-FORMS: updateSubmissionFile saveFileStream saved", {fileSavedResult: fileSavedResult});

      if (options.keepFile) {
        return cb();
      } else {
        logger.debug("FH-FORMS: updateSubmissionFile remove file", {fileStream: fileDetails.fileStream});
        fs.unlink(fileDetails.fileStream, function(err) {
          if (err) {
            logger.error("FH-FORMS: updateSubmissionFile remove file", {fileStream: fileDetails.fileStream});
          }
          return cb();
        });
      }
    });
  }

  function deleteOldFile(cb) {

    logger.debug("FH-FORMS: updateSubmissionFile deleteOldFile", {version: fileSavedResult.version});

    if (fileSavedResult.version > 1) {
      fileHandler.deleteFile(connections.databaseConnection, {"groupId" : fileDetails.groupId, "version": fileSavedResult.version - 1}, cb);
    } else {
      return cb();
    }
  }

  function updateSubmission(cb) {
    logger.debug("FH-FORMS: updateSubmissionFile updateSubmission", {submissionToUpdate: submissionToUpdate});

    //Checking if the field entry already exists.
    var foundFormFieldEntry = _.find(submissionToUpdate.formFields, function(formField) {
      return formField.fieldId.toString() === submission.fieldId.toString();
    });

    //There may not already be an entry for the field value if it is not a required field.
    if (!foundFormFieldEntry) {
      submissionToUpdate.formFields.push({
        fieldId: submission.fieldId.toString(),
        fieldValues: []
      });
    }
    submissionToUpdate.formFields = _.map(submissionToUpdate.formFields, function(formField) {

      if (formField.fieldId.toString() === submission.fieldId.toString()) {
        if (addingNewSubmissionFile) {
          formField.fieldValues.push(_.extend(fileDetails, {groupId: fileSavedResult.groupId}));
        } else {
          formField.fieldValues = _.map(formField.fieldValues, function(fieldValue) {
            if (fieldValue.groupId.toString() === fileSavedResult.groupId.toString()) {
              fieldValue.fileName = fileDetails.fileName;
              fieldValue.fileSize = fileDetails.fileSize;
              fieldValue.fileType = fileDetails.fileType;
            }

            return fieldValue;
          });
        }
      }

      return formField;
    });

    // [db-inspect] write to db
    submissionToUpdate.markModified("formFields");
    submissionToUpdate.save(cb);
  }
};


module.exports.updateSubmissionFile = updateSubmissionFile;
