var async = require('async');
var _ = require('underscore');
var buildErrorObject = require('../common/misc.js');
var CONSTANTS = require('../common/constants.js');
var mergeFormFields = require('./submissionExportHelper/mergeFormFields');
var processSingleSubmission = require('./submissionExportHelper/processSingleSubmission');
var moment = require('moment');
var logger = require('../common/logger.js').getLogger();
var models = require('../common/models')();
var csvHeaders = require('./submissionExportHelper/csvHeaders');
var buildQuery = require('./getSubmissions/buildQuery');
var searchSubmissions = require('./searchSubmissions');
var updateCSVExportStatus = require('./submissionExportHelper/updateCSVExportStatus');

/**
 * Creating an updater function for export
 *
 * @param connections                     Mongoose and mongodb connections
 * @param    {boolean} isAsync            Flag to indicated whether the CSV export is synchronous or asynchronous.
 * @returns {function} updateExportStatus
 */
function getStatusUpdater(connections, isAsync) {
  return function updateExportStatus(statusUpdate, cb) {
    cb = cb || _.noop;
    if (isAsync) {
      updateCSVExportStatus(connections, statusUpdate, cb);
    } else {
      return cb();
    }
  };
}

/**
 * generateQuery - Generating either a basic query or advanced search query
 *
 * @param  {object} searchParams          params to search submissions by
 * @param  {array} searchParams.formId   Array of form IDs to search for
 * @param  {array} searchParams.subid   Array of submission IDs to search for
 * @param  {string} searchParams.filter A string value to filter the submissions by metadata
 * @param  {string} searchParams.query  An advanced submission query object
 * @param  {array} searchParams.appId   Array of Project IDs to search for
 * @param  {function} cb
 * @return {object} Generated mongo query
 */
function generateQuery(searchParams, cb) {
  if (searchParams.query ) {
    searchSubmissions.queryBuilder(searchParams.query, cb);
  } else {
    return cb(undefined, buildQuery(searchParams));
  }
}

/**
 * buildCompositeForm - Building a merged list of fields based on the
 *
 * @param  {Model}  formSubmissionModel The Submission mongoose Model
 * @param  {string} formId              The ID of the form to search for
 * @param  {object} singleFormQuery     A mongo query to find all of the submissions to search for
 * @param  {function} statusUpdaterFunction  A function to update the status of an async submission export
 * @param  {function} cb
 */
function buildCompositeForm(formSubmissionModel, formId, singleFormQuery, statusUpdaterFunction, cb) {
  var mergedFields = {};
  mergedFields[formId] = {};

  logger.debug("buildCompositeForm start");

  statusUpdaterFunction({
    message: "Creating form metadata for submissions with form ID: " + formId
  });

  var mapReduceOptions = {
    map: function() {
      //The only difference will be the "lastUpdated" timestamp.
      emit(this.formSubmittedAgainst.lastUpdated, this.formSubmittedAgainst); // eslint-disable-line no-undef
    },
    reduce: function(lastUpdatedTimestamp, formEntries) {
      //Only want one of each form definition for each different timestamp
      var formEntry = formEntries[0];

      //Only need the pages, _id and name
      if (formEntry && formEntry.pages) {
        return {
          _id: formEntry._id,
          name: formEntry.name,
          pages: formEntry.pages
        };
      } else {
        return null;
      }
    },
    query: singleFormQuery
  };

  formSubmissionModel.mapReduce(mapReduceOptions, function(err, subFormsSubmittedAgainst) {
    if (err) {
      logger.error("Error Using mapReduce ", err);
      return cb(err);
    }

    statusUpdaterFunction({
      message: "Finished Creating form metadata for submissions with form ID: " + formId
    });

    logger.debug("buildCompositeForm finish");

    var formName = "";

    _.each(subFormsSubmittedAgainst, function(subFormSubmittedAgainst) {
      formName = formName || subFormSubmittedAgainst.value.name;
      mergedFields[formId] = mergeFormFields(mergedFields[formId] || {}, subFormSubmittedAgainst.value);
    });

    return cb(null, mergedFields, formName);
  });
}


/**
 * buildCSVsForSingleMergedForm - Building a CSV representation of a submission based on the merged definiton of all of the versions of the form it was submitted against.
 *
 * @param  {Model}  formSubmissionModel                           The Submission mongoose Model
 * @param  {type}   params
 * @param  {string} params.formId
 * @param  {function} params.statusUpdaterFunction                Function to update the status of a submission export.
 * @param  {string} params.date                                   Formatted date of export
 * @param  {string} params.formName                               Form Name
 * @param  {object} params.mergedFields                           Set of merged field definitions
 * @param  {string} params.fieldHeader                            Field header to use for export
 * @param  {object} params.singleFormQuery                        Query to search for submissions based in a form ID
 * @param  {number} params.exportCounter.numSubmissionsToExport   The total number of submissions to export
 * @param  {number} params.exportCounter.numSubsExported          The total number of submissions exported to date
 * @param  {string} params.downloadUrl                            The downloadUrl template to use when generating submission file URLs.
 * @param  {function} cb
 */
function buildCSVsForSingleMergedForm(formSubmissionModel, params, cb) {
  var formId = params.formId;
  var formName = params.formName;
  var date = params.date;
  var mergedFields = params.mergedFields;
  var fieldHeader = params.fieldHeader;
  var singleFormQuery = params.singleFormQuery;
  var downloadUrl = params.downloadUrl;

  var fullSubmissionCSVString = "";
  //Form Name might not be unique but the ID will always be.
  var fileName = date + "-" + formId + "-" + (formName.split(' ').join('_'));
  //Query the submissions for the formId
  //LEAN
  //Select only the metadata and formFields in the submission.
  // Stream response
  // Build CSV string for each entry.
  // Add to the zip file.
  cb = _.once(cb);

  params.statusUpdaterFunction({
    message: "Beginning export of submissions for form ID: " + formId
  });

  var exportProgressInterval = setInterval(function() {
    params.statusUpdaterFunction({
      message: "Exporting submission " + params.exportCounter.numSubsExported + " of " + params.exportCounter.numSubmissionsToExport
    });
  }, 1000);

  //First, generate headers.
  fullSubmissionCSVString = csvHeaders.generateCSVHeaders(_.keys(mergedFields[formId]), mergedFields[formId], fieldHeader);

  var submissionQueryStream = formSubmissionModel.find(singleFormQuery).select({
    "formSubmittedAgainst.pages": 0,
    "formSubmittedAgainst.pageRules": 0,
    "formSubmittedAgainst.fieldRules": 0
  }).lean().stream();

  submissionQueryStream.on('data', function addSubmissionToCSV(submissionJSON) {
    //Merge the form fields
    fullSubmissionCSVString += processSingleSubmission({
      mergedFields: mergedFields,
      submission: submissionJSON,
      date: date,
      fieldHeader: fieldHeader,
      downloadUrl: downloadUrl
    });

    params.exportCounter.numSubsExported ++;
  }).on('error', function(err) {
    logger.error("Error streaming submissions ", err);
    clearInterval(exportProgressInterval);
    return cb(err);
  }).on('close', function() {
    clearInterval(exportProgressInterval);
    return cb(undefined, {
      formId: formId,
      fileName: fileName,
      csvString: fullSubmissionCSVString
    });
  });
}

/**
 * buildCSVsForSingleForm - Generating the full CSV file for a single form.
 *
 * @param  {Model}    formSubmissionModel description
 * @param  {object}   params
 * @param  {function} params.statusUpdaterFunction                Function to update the status of the export.
 * @param  {string}   params.formId
 * @param  {string}   params.date                                 Formatted date of export
 * @param  {object}   params.searchParams                         Submission Parameters To Search By
 * @param  {array}    params.searchParams.formId                  Array of form IDs to search for
* @param  {array}    params.searchParams.subid                    Array of submission IDs to search for
 * @param  {string} params.searchParams.filter                    A string value to filter the submissions by metadata
 * @param  {array} params.searchParams.appId                      Array of Project IDs to search for
 * @param  {string} params.searchParams.fieldHeader               Field header to use (fieldName or fieldCode)
 * @param  {string} params.searchParams.downloadUrl               URL to use for file downloads
 * @param  {number} params.exportCounter.numSubmissionsToExport   The total number of submissions to export
 * @param  {number} params.exportCounter.numSubsExported          The total number of submissions exported to date
 * @param  {string} formId                                        The ID of the form to export
 * @param  {function} callback
 * @return {type}
 */
function buildCSVsForSingleForm(formSubmissionModel, params, formId, callback) {
  logger.debug("buildCSVsForSingleForm", params, formId);

  var date = params.date;
  var searchParams = params.searchParams || {};
  var fieldHeader = searchParams.fieldHeader;
  var downloadUrl = searchParams.downloadUrl || "";

  formId = formId.toString();

  params.statusUpdaterFunction({
    message: "Starting export of submissions for form with ID:" + formId
  });

  generateQuery(_.defaults({
    formId: formId
  }, searchParams), function(err, singleFormQuery) {
    if (err) {
      return callback(err);
    }

    async.waterfall([
      async.apply(buildCompositeForm, formSubmissionModel, formId, singleFormQuery, params.statusUpdaterFunction),
      function buildSubmissionCSVForSingleForm(mergedFields, formName, cb) {
        buildCSVsForSingleMergedForm(formSubmissionModel, {
          date: date,
          fieldHeader: fieldHeader,
          downloadUrl: downloadUrl,
          mergedFields: mergedFields,
          formName: formName,
          formId: formId,
          exportCounter: params.exportCounter,
          singleFormQuery: singleFormQuery,
          statusUpdaterFunction: params.statusUpdaterFunction
        }, cb);
      }
    ], callback);
  });
}

/**
 * module - Exporting A Submission/Submissions As A Zip File Containing CSV Files
 *
 * @param  {object} connections                 mongo and mongoose connections
 * @param  {object} options                     Mongo connection Options
 * @param  {boolean} options.asyncCSVExport     Flag to mark the CSV Export as an async task.
 * @param  {object} searchParams                params to search by
 * @param  {array} searchParams.formId          Array of form IDs to search for
 * @param  {array} searchParams.subid           Array of submission IDs to search for
 * @param  {string} searchParams.filter         A string value to filter the submissions by metadata
 * @param  {string} searchParams.query          An advanced submission query object
 * @param  {array} searchParams.appId           Array of Project IDs to search for
 * @param  {string} searchParams.downloadUrl    Download url to use for files
 * @param  {string} searchParams.fieldHeader    Field header to use (fieldName or fieldCode)
 * @param  {function} callback
 * @return {type}
 */
// [db-inspect] reads submissions from db. user data
module.exports = function(connections, options, searchParams, callback) {
  logger.debug("exportSubmissions ", {
    searchParams: searchParams
  });
  var formSubmissionModel = models.get(connections.mongooseConnection, models
    .MODELNAMES.FORM_SUBMISSION);
  var date = moment().format("YYYY-MM-DD-hh-mm");

  searchParams = searchParams || {};
  var numSubmissionsToExport = 0;

  var statusUpdaterFunction = getStatusUpdater(connections, options.asyncCSVExport);

  async.waterfall([
    //If there is an advanced query, then build that query type.
    async.apply(generateQuery, searchParams),
    function countSubmissionsToExport(query, cb) {
      formSubmissionModel.count(query, function(err, numSubs) {
        if (err) {
          logger.error({error: err}, "Error counting submissions");
          return cb(err);
        }

        logger.debug({numSubmissionsToExport: numSubs, query: query}, "Total number of submissions to export.");

        numSubmissionsToExport = numSubs;

        statusUpdaterFunction({
          message: "Total number of submissions to export: " + numSubs
        }, function callbackWithQuery() {
          return cb(null, query);
        });
      });
    },
    // [db-inspect] read submissions from db
    function findDistinctFormIds(query, cb) {
      //Querying for all of the "unique" form IDs available in submissions.
      formSubmissionModel.find(query).distinct('formId', function(err, formIds) {
        if (err) {
          logger.error(
            "Error finding distinct form IDs for submissions", err);
        }

        return cb(err, formIds || [], query);
      });
    },
    function buildCSVsForSingleForms(formIds, query, cb) {
      var exportCounter = {
        numSubmissionsToExport: numSubmissionsToExport,
        numSubsExported: 0
      };

      //Go through each of the submissions (stream) to generate each individual CSV entry
      async.mapSeries(formIds, async.apply(buildCSVsForSingleForm, formSubmissionModel, {
        date: date,
        exportCounter: exportCounter,
        searchParams: searchParams,
        query: query,
        statusUpdaterFunction: statusUpdaterFunction
      }), cb);
    }
  ], function(err, exportedSubmissions) {
    if (err) {
      logger.error("Error Exporting Submissions", {
        error: err
      });
      statusUpdaterFunction({
        message: "Error exporting submissions " + err.message,
        status: CONSTANTS.SUBMISSION_CSV_EXPORT.STATUS_ERROR,
        error: err
      });
      return callback(buildErrorObject({
        error: err,
        code: CONSTANTS.ERROR_CODES.FH_FORMS_ERR_CODE_SUBMISSION_EXPORT
      }));
    }

    var res = {};
    _.each(exportedSubmissions, function(exportDetails) {
      res[exportDetails.fileName] = exportDetails.csvString;
    });

    callback(undefined, res);
  });
};
