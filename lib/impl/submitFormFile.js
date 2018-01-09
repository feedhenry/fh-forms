var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var fhgridfs = require("fh-gridfs").MongoFileHandler;
var async = require("async");
var fs = require("fs");
var mime = require("mime");
var logger = require('../common/logger.js').getLogger();

//options: {:fileid, :submissionId, :fieldId, :fileStream, :fileName}
var submitFormFile = function(connections, options, cb) {
  logger.debug("FH-FORMS submitFormFile ", {options: options});
  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var submissionToUse;
  var submissionFieldIndex;
  var filePlaceholderIndex;
  var savedFileGroupId;
  var submission = options.submission;
  var fileHandler = new fhgridfs();

  logger.info("submitFormFile: begin", submission);

  if (!submission) {
    return cb(new Error("No data submitted"));
  }

  var validateOptions = validate(submission);
  validateOptions.has("fileId", "submissionId", "fieldId", "fileStream", function(failure) {
    if (failure) {
      logger.warn("submitFormFile: validation failure", failure);
      return cb(failure);
    }

    logger.info("submitFormFile: validation complete");

    if (!fs.existsSync(submission.fileStream)) {
      logger.error("submitFormFile: file does not exist.", submission.fileStream);
      return cb(new Error("File upload does not exist, aborting."));
    }

    async.series([getSubmission, findPlaceholder, saveFileStream, updateSubmission], function(err) {
      if (err) {
        logger.warn("submitFormFile: Error saving file", err);
        return cb(err);
      }

      logger.info("submitFormFile: file saved", savedFileGroupId);

      var resultJSON = {};
      resultJSON.status = 200;
      resultJSON.savedFileGroupId = savedFileGroupId;
      resultJSON.formSubmission = submissionToUse.toJSON();

      return cb(undefined, resultJSON);
    });
  });

  function getSubmission(cb) {
    logger.info("submitFormFile getSubmission");
    // [db-inspect] read from submissions db. user data
    FormSubmission.findOne({"_id": submission.submissionId}, function(err, foundSubmission) {
      if (err) {
        logger.error("submitFormFile: Error getting submission", err);
        return cb(err);
      }

      if (foundSubmission === null || foundSubmission === undefined) {
        return cb(new Error("No submission found matching submission id " + submission.submissionId));//TODO -- Need to do error codes
      }

      //Submission found, find the fileId
      submissionToUse = foundSubmission;
      return cb();
    });
  }

  function findPlaceholder(cb) {
    logger.info("submitFormFile: findPlaceholder");
    logger.debug("FH-FORMS submitFormFile findPlaceholder", {submissionToUse: submissionToUse, submission: submission});

    var indexesOfFields = [];
    for (var formFieldIndex = 0; formFieldIndex < submissionToUse.formFields.length ; formFieldIndex++) {
      if (submissionToUse.formFields[formFieldIndex].fieldId.toString() === submission.fieldId.toString()) {
        indexesOfFields.push(formFieldIndex);
      }
    }

    if (indexesOfFields.length === 0) {
      return cb(new Error("No field with id " + submission.fieldId + " exists in submission " + submissionToUse._id));
    }

    var indexOfFilePlaceholder = -1;

    indexesOfFields.forEach(function(indexOfField) {
      var submissionEntry = submissionToUse.formFields[indexOfField];

      for (var i = 0; i < submissionEntry.fieldValues.length; i++) {
        if (submissionEntry.fieldValues[i].hashName.toString() === submission.fileId.toString()) {
          indexOfFilePlaceholder = i;
          submissionFieldIndex = indexOfField;
          break;
        }
      }
    });

    if (indexOfFilePlaceholder === -1) {
      return cb(new Error("No file with id " + submission.fileId + " exists in field " + submission.fieldId + " for submission " +  submissionToUse._id));
    }

    filePlaceholderIndex = indexOfFilePlaceholder;

    logger.info("submitFormFile: findPlaceholder done", filePlaceholderIndex);

    return cb();
  }

  function saveFileStream(cb) {
    logger.info("submitFormFile: saveFileStream", submission.fileStream);
    //Path to the file is passed, create a read stream
    var submittedFileStream = fs.createReadStream(submission.fileStream);
    submittedFileStream.pause();

    var fileDetails = submissionToUse.formFields[submissionFieldIndex].fieldValues[filePlaceholderIndex];

    var fileNameToSave = fileDetails.fileName;
    var fileExtension = mime.extension(fileDetails.fileType);

    if (fileNameToSave.indexOf("." + fileExtension) === -1) {
      fileNameToSave += "." + fileExtension;
    }

    var saveFileOptions = {};

    if (submission.decodeBase64) {
      saveFileOptions.decodeBase64 = true;
    }

    logger.info("submitFormFile: before fileHandler.saveFile", saveFileOptions);

    fileHandler.saveFile(connections.databaseConnection, fileNameToSave , submittedFileStream, saveFileOptions, function(err, saveResult) {
      if (err) {
        logger.warn("submitFormFile: Error saving file to gridfs", err);
        return cb(err);
      }

      logger.info("submitFormFile: File save complete", saveResult);

      savedFileGroupId = saveResult.groupId.toString();

      if (submission.keepFile) {
        logger.info("submitFormFile: keeping file");
        return cb();
      } else {
        logger.info("submitFormFile: removing file");
        fs.unlink(submission.fileStream, function(err) {
          if (err) {
            logger.error("submitFormFile: Error removing file");
            console.error(err);
          }
          return cb();
        });
      }
    });
  }

  function updateSubmission(cb) {
    //Form file saved, now the submission can be updated to the groupId belonging to the file
    logger.info("submitFormFile: updatesubmission");
    submissionToUse.formFields[submissionFieldIndex].fieldValues[filePlaceholderIndex].groupId = savedFileGroupId;
    submissionToUse.markModified("formFields");
    submissionToUse.save(cb);
  }
};

module.exports = submitFormFile;
