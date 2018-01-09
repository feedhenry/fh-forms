var models = require('../../common/models.js')();
var _ = require('lodash');
var logger = require('../../common/logger.js').getLogger();
var handleListResult = require('./processListResult');
var buildQuery = require('./buildQuery');
var CONSTANTS = require('../../common/constants');


/**
 * paginateList - Returning a paginated list of submissions.
 *
 * @param  {object} formSubmissionModel Submission Mongoose Model
 * @param  {object} params
 * @param  {object} params.query          Query to filter by.
 * @param  {object} params.paginate       Pagination parameters
 * @param  {number} params.paginate.page  Pagination page
 * @param  {number} params.paginate.limit Page to return
 * @param  {number} params.paginate.filter String to filter submissions by
 * @param  {function} callback
 */
function paginateList(formSubmissionModel, params, callback) {
  logger.debug("paginateList", params);
  var query = params.query || {};
  var paginate = params.paginate || {};
  var fieldModel = params.fieldModel;

  //Sorting can be defined by the user
  var sortBy = params.sortBy || {
    submissionCompletedTimestamp: -1
  };

  formSubmissionModel.paginate(query, {
    page: paginate.page,
    limit: paginate.limit,
    select: CONSTANTS.SUBMISSION_SUMMARY_FIELD_SELECTION,
    populate: {"path": "formFields.fieldId", "model": fieldModel, "select": "_id type name"},
    sortBy: sortBy,
    lean: true
  }, function(err, submissionsResult) {

    //Returning pagination metadata. Useful for displaying tables etc.
    var paginationResult = _.extend({
      pages: submissionsResult.pages,
      total: submissionsResult.total
    }, params);

    handleListResult(err, paginationResult, submissionsResult.docs, callback);
  });
}

/**
 * nonPaginateList - Listing submissions without pagination
 *
 * @param  {object} formSubmissionModel Submission Mongoose Model
 * @param  {object} params
 * @param  {object} params.query          Query to filter by.
 * @param  {function} callback
 */
function nonPaginateList(formSubmissionModel, params, callback) {
  logger.debug("nonPaginateList", params);
  var submissionQuery = formSubmissionModel.find(params.query || {});
  var fieldModel = params.fieldModel;

  //Sorting can be defined by the user
  var sortBy = params.sortBy || {
    submissionCompletedTimestamp: -1
  };

  //If the full submission is not required, then limit the response payload size.
  if (!params.includeFullSubmission) {
    submissionQuery.select({"formSubmittedAgainst.name": 1, "_id": 1, "formId": 1, "appId": 1, "appEnvironment": 1, "formFields": 1});
  }
  // [db-inspect] read from submissions db. user data
  submissionQuery.sort(sortBy)
  .populate({"path": "formFields.fieldId", "model": fieldModel, "select": "_id type name"})
  //Assigning a lean query to not parse the response as a mongoose document. This is to improve query performance.
  .lean()
  .exec(function(err, foundSubmissions) {
    handleListResult(err, params, foundSubmissions, callback);
  });
}

/**
 * getSubmissionList - Getting a list of submissions
 *
 * @param  {object}  connections                      Mongo and Mongoose connections
 * @param  {object}  connections.mongooseConnection   Mongoose Connection
 * @param  {object}  options                          Connection options
 * @param  {boolean} options.includeFullSubmission    Flag on whether to include the full submission definition or a trimmed version
 * @param  {object} params                            Params to filter by.
 * @param  {string/array} params.appId                Optional Project ID(s) To Filter Submissions
 * @param  {string/array} params.formId               Optional Form ID(s) To Filter Submissions
 * @param  {string/array} params.subid                Optional Submission ID(s) To Filter Submissions
 * @param  {function} cb
 */
module.exports = function getSubmissionList(connections, options, params, cb) {
  logger.debug("getSubmissionList ", {options: options, params: params});
  var formSubmissionModel = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
  var fieldModel = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);

  var query = buildQuery(params);

  logger.debug("getSubmissionList ", {query: query, params: params});

  //Checking if the results need to be paginated
  if (params.paginate) {
    paginateList(formSubmissionModel, _.extend({
      query: query,
      fieldModel: fieldModel,
      includeFullSubmission: options.includeFullSubmission
    }, params), cb);
  } else {
    nonPaginateList(formSubmissionModel, _.extend({
      query: query,
      fieldModel: fieldModel,
      includeFullSubmission: options.includeFullSubmission
    }, params), cb);
  }
};
