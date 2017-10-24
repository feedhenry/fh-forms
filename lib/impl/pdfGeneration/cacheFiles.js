var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var buildErrorResponse = require('../../common/misc.js').buildErrorResponse;
var logger = require('../../common/logger.js').getLogger();
var getSubmissionFile = require('../getSubmissionFile.js');
var constants = require('../../common/constants.js');
var mbaasClient = require('fh-mbaas-client');
var processForm = require('./processForm');
/**
 *
 * @param params - object containing the submission details to merge
 *  - form
 *  - submissionFiles
 *  - downloadUrl
 * @returns {*}
 *
 */
function populateSubmissionFileData(params) {
  params = params || {};
  var submissionForm = params.form;
  var submissionFiles = params.submissionFiles || [];
  //Download url for the file.
  var downloadUrl = "" + params.downloadUrl + params.fileUriPath;

  logger.debug("cacheFiles: populateSubmissionFileData ", {params: params, downloadUrl: downloadUrl});


  var processedForm = processForm(submissionForm, params.submission);

  submissionForm.pages = _.map(processedForm.form.pages, function(page) {
    page.fields = _.map(page.fields, function(field) {
      field.repeatingSectionsProcessed = true;
      if (field.type === "sectionBreak" && field.repeating) {
        field.repeating = false;
        field.repeatingSectionTurnedOff = true;
      }
      if (field.type === "photo" || field.type === "signature") {
        field.values = _.map(field.values, function(fieldValue) {
          fieldValue.url = _.findWhere(submissionFiles, {fileId: fieldValue.groupId}).url;
          return fieldValue;
        });
      } else if (field.type === "file") {
        field.values = _.map(field.values, function(fieldValue) {
          fieldValue.url = downloadUrl.replace(":id", params.submission._id).replace(":fileId", fieldValue.groupId);
          return fieldValue;
        });

      }
      return field;
    });

    return page;
  });

  return submissionForm;
}


function downloadFileFromMbaas(params, fileToStreamTo, cb) {
  mbaasClient.initEnvironment(params.options.environment, params.options.mbaasConf);

  mbaasClient.admin.submissions.getSubmissionFile({
    environment: params.options.environment,
    domain: params.options.domain,
    id: params.submission._id,
    fileId: params.fileId
  }, function(err, fileRequestStream) {
    if (err) {
      return cb(err);
    }

    fileRequestStream.on('error', function(err) {
      logger.error("Error Streaming File With Id: " + params.fileId);
      return cb(err);
    });

    fileRequestStream.on('end', function() {
      logger.debug("Stream Complete For File With Id: " + params.fileId);
      return cb(undefined, {});
    });

    //Streaming The File
    fileRequestStream.pipe(fileToStreamTo);
  });
}

/**
 * Streaming The File From The Database.
 *
 * @param params
 *   - options
 *   - fileId
 *   - connections
 * @param fileToStreamTo
 * @param cb
 */
function cacheSubmissionFile(params, fileToStreamTo, cb) {
  //If the files are remote, use the mbaas client
  logger.debug("cacheFiles: cacheSubmissionFile submission", {params: params, fileToStreamTo: fileToStreamTo});
  if (params.options.filesAreRemote) {
    return downloadFileFromMbaas(params, fileToStreamTo, cb);
  }

  //File is in the local database, load it there
  getSubmissionFile(params.connections, params.options, {
    _id: params.fileId
  }, function(err, fileDetails) {
    if (err) {
      logger.error("cacheFiles: cacheSubmissionFile getSubmissionFile", {error: err});
      return cb(err);
    }

    fileDetails.stream.on('error', function(err) {
      logger.error("cacheFiles: cacheSubmissionFile Error Streaming File With Id: " + params.fileId);
      return cb(err);
    });

    fileDetails.stream.on('end', function() {
      logger.debug("cacheFiles: cacheSubmissionFile Stream Complete For File With Id: " + params.fileId);
      return cb(undefined, fileDetails);
    });

    //Streaming The File
    fileDetails.stream.pipe(fileToStreamTo);
    fileDetails.stream.resume();
  });
}

/**
 * Function to check if a field is a file type
 * @param fieldType
 * @returns {boolean}
 */
function isFileFieldType(fieldType) {
  return (fieldType === 'photo' || fieldType === 'signature' || fieldType === 'file');
}


/**
 * Caching any files needed for a submission to the file system.
 *
 * @param params
 *  - submission
 *  - connections
 *  - options
 * @param cb
 * @returns {*}
 * @private
 */
function mergeSubmissionFiles(params, cb) {
  logger.debug("cacheFiles: mergeSubmissionFiles", params);
  var submission = params.submission;

  //No submission, cannot continue.
  if (!_.isObject(submission)) {
    return cb(buildErrorResponse({
      err: new Error("Expected Submission Object To Cache Files For"),
      msg: "Error Exporting Submission As PDF",
      httpCode: 500
    }));
  }

  var form = submission.formSubmittedAgainst;


  var fileFieldDetails = _.filter(submission.formFields, function(field) {
    return isFileFieldType(field.fieldId.type);
  });
  fileFieldDetails = _.flatten(fileFieldDetails);


  var fieldTypes = _.groupBy(fileFieldDetails, function(field) {
    return field.fieldId.type;
  });

  //Files That Have To Be Loaded From Mbaas
  var mbaasTypes = _.union(fieldTypes.photo, fieldTypes.signature);

  //Only Interested In The File Ids To Download
  var filesToDownload = _.map(mbaasTypes, function(field) {
    return _.map(field.fieldValues, function(fieldValue) {
      return fieldValue.groupId;
    });
  });

  filesToDownload = _.flatten(filesToDownload);

  logger.debug("cacheFiles: mergeSubmissionFiles filesToDownload", filesToDownload);


  //Now download all of the files..
  async.mapSeries(filesToDownload, function(fileIdOrUrl, cb) {
    //Only want the callback to be called once.
    cb = _.once(cb);

    var fileUri = path.join(params.options.pdfExportDir, 'image_binary_' + fileIdOrUrl);
    var localFile = fs.createWriteStream(fileUri);

    //Loading The Submission File From THe Database / MbaaS
    cacheSubmissionFile({
      fileId: fileIdOrUrl,
      connections: params.connections,
      options: params.options,
      submission: submission
    }, localFile, function(err, fileDetails) {
      if (err) {
        logger.error("cacheFiles: cacheSubmissionFile", {error: err});
      }
      fileDetails = fileDetails || {};
      fileDetails.url = "file://" + fileUri;
      fileDetails.fileId = fileIdOrUrl;

      logger.debug("cacheFiles: mergeSubmissionFiles fileDetails", fileDetails);

      return cb(err, _.omit(fileDetails, "stream"));
    });
  }, function(err, cachedFiles) {
    if (err) {
      return cb(buildErrorResponse({
        error: err,
        msg: "Error Cacheing Files For Submission Export",
        code: constants.ERROR_CODES.FH_FORMS_ERR_CODE_PDF_GENERATION,
        httpCode: 500
      }));
    }

    //No Errors, all files are now cached for the submission

    submission.formSubmittedAgainst =  populateSubmissionFileData({
      form: form,
      submissionFiles: cachedFiles,
      downloadUrl: params.options.downloadUrl,
      fileUriPath: params.options.fileUriPath,
      submission: submission
    });

    logger.debug("cacheFiles: mergeSubmissionFiles submission", submission);

    cb(undefined, submission);
  });
}

/**
 * Removing Any Cached Files Needed For Rendering The PDF
 * @param params
 * @param cb
 * @private
 */
function removeCachedFiles(params, cb) {
  //Cleaning Up Any Files Cached To Render The Submission.
  logger.debug("cacheFiles: mergeSubmissionFiles Removing Cached Files For PDF Generation: ", params.submissionFiles);
  async.eachSeries(params.submissionFiles || [], function(submissionFileDetails, cb) {
    logger.debug("Removing Cached File: ", submissionFileDetails);
    fs.unlink(submissionFileDetails.url, function(err) {
      if (err) {
        logger.error('Error Removing File At' + submissionFileDetails.url);
      }

      return cb();
    });
  }, cb);
}


module.exports = {
  populateSubmissionFileData: populateSubmissionFileData,
  cacheSubmissionFile: cacheSubmissionFile,
  isFileFieldType: isFileFieldType,
  mergeSubmissionFiles: mergeSubmissionFiles,
  removeCachedFiles: removeCachedFiles
};