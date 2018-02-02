var forms = require('../forms.js');
var _ = require('underscore');
var formsResultHandlers = require('./resultHandlers.js');
var constants = require('../common/constants.js').MIDDLEWARE;
var async = require('async');
var logger = require('../common/logger.js').getLogger();

/**
 * List All Forms
 * @param req
 * @param res
 * @param next
 */
function list(req, res, next) {
  var notStats = req.query && (req.query.notStats === 'true' || req.query.notStats === true);
  var opts = _.extend(req.connectionOptions, { notStats: notStats });

  logger.debug("List Forms Middleware ", opts);
  forms.getAllForms(opts, formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Listing Forms Deployed To An Environment
 * @param req
 * @param res
 * @param next
 */
function listDeployedForms(req, res, next) {
  var projectForms = req.appformsResultPayload.data || [];
  logger.debug("Middleware: listDeployedForms: ", {connection: req.connectionOptions, projectForms: projectForms});

  //Only Want The Project Ids
  projectForms = _.map(projectForms, function(form) {
    if (_.isObject(form)) {
      return form._id;
    } else {
      return form;
    }
  });

  forms.findForms(req.connectionOptions, projectForms, formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Function to list forms that are deployed.
 *
 * The request should contain an array of deployed forms.
 *
 * @param req
 * @param res
 * @param next
 */
function search(req, res, next) {
  var projectForms = req.appformsResultPayload.data || [];
  //Only Want The Project Ids
  projectForms = _.map(projectForms, function(form) {
    if (_.isObject(form)) {
      return form._id;
    } else {
      return form;
    }
  });

  var formsToFind = req.body || [];

  formsToFind = _.filter(projectForms, function(projFormId) {
    return formsToFind.indexOf(projFormId) > -1;
  });

  logger.debug("Middleware: search forms: ", {connection: req.connectionOptions, projectForms: projectForms});

  forms.findForms(req.connectionOptions, formsToFind, function(err, formsList) {
    if (err) {
      return next(err);
    }

    async.map(formsList, function(foundForm, cb) {
      var getParams = {
        "_id": foundForm._id,
        "showAdminFields": false
      };
      forms.getForm(_.extend(_.clone(req.connectionOptions), getParams), cb);
    }, formsResultHandlers(constants.resultTypes.forms, req, next));
  });
}

/**
 * Create A New Form
 * @param req
 * @param res
 * @param next
 */
function create(req, res, next) {
  var options = req.connectionOptions;
  req.user = req.user || {};
  var params = {
    userEmail: req.user.email || req.body.updatedBy
  };

  options = _.extend(options, params);

  logger.debug("Middleware: create form: ", {options: options});

  forms.updateForm(options, req.body, formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Deploying A Form. Creates A Form If It Already Exists
 * @param req
 * @param res
 * @param next
 */
function deploy(req, res, next) {
  var options = req.connectionOptions;
  var form = req.body;
  req.user = req.user || {};

  if (req.appformsResultPayload && _.isObject(req.appformsResultPayload.data)) {
    form = req.appformsResultPayload.data;
  }

  //Expect A Data Source Data Set To Be Available If Deploying A Form.
  var params = {
    userEmail: req.user.email || req.body.updatedBy,
    expectDataSourceCache: true
  };

  options = _.extend(options, params);

  logger.debug("Middleware: Deploy form: ", {options: options});

  forms.updateOrCreateForm(options, form, formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Get A Single Form Definition
 * @param req
 * @param res
 * @param next
 */
function get(req, res, next) {

  //Admin Fields And Data Sources Should Not Be Shown For App Requests
  var showAdminAndDataSources = !req.params.projectid;

  var getParams = {
    "_id": req.params.id,
    "showAdminFields": showAdminAndDataSources,
    includeDataSources: showAdminAndDataSources,
    //Data Source Caches are required for app requests
    expectDataSourceCache: !showAdminAndDataSources
  };

  logger.debug("Middleware: Get form: ", {getParams: getParams});

  forms.getForm(_.extend(req.connectionOptions, getParams), formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Update A Single Existing Form
 * @param req
 * @param res
 * @param next
 */
function update(req, res, next) {
  var options = req.connectionOptions;
  req.appformsResultPayload = req.appformsResultPayload || {};

  var params = {
    userEmail: req.user.email
  };

  options = _.extend(options, params);

  var form = req.body;

  if (_.isObject(req.appformsResultPayload.data) && !req.body._id) {
    form = req.appformsResultPayload.data;
  }

  logger.debug("Middleware: Update form: ", {options: options, form: form});

  forms.updateForm(options, form, formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Remove An Existing Form. Also removes submission data.
 * @param req
 * @param res
 * @param next
 */
function remove(req, res, next) {
  var removeParams = {
    _id: req.params.id,
    removeSubmissionData: true
  };

  logger.debug("Middleware: Remove form: ", {params: removeParams});

  forms.deleteForm(_.extend(req.connectionOptions, removeParams), formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Undeploy An Existing Form. Does not remove any submission data.
 * @param req
 * @param res
 * @param next
 */
function undeploy(req, res, next) {
  var removeParams = {
    _id: req.params.id
  };

  logger.debug("Middleware: undeploy form: ", {params: removeParams});

  forms.deleteForm(_.extend(req.connectionOptions, removeParams), formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * List All Subscribers For A Form
 * @param req
 * @param res
 * @param next
 */
function listSubscribers(req, res, next) {
  var listSubscribersParams = {
    _id: req.params.id
  };

  logger.debug("Middleware: listSubscribers: ", {params: listSubscribersParams});

  forms.getNotifications(_.extend(req.connectionOptions, listSubscribersParams), formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Update The Subscribers Associated With A Form
 * @param req
 * @param res
 * @param next
 */
function updateSubscribers(req, res, next) {
  var updateSubscribersParams = {
    _id: req.params.id
  };

  var subscribers = req.body.subscribers;

  logger.debug("Middleware: listSubscribers: ", {params: updateSubscribersParams, subscribers: subscribers});

  forms.updateNotifications(_.extend(req.connectionOptions, updateSubscribersParams), subscribers, formsResultHandlers(constants.resultTypes.forms, req, next));
}


/**
 * Clone An Existing Form
 * @param req
 * @param res
 * @param next
 */
function clone(req, res, next) {
  var cloneFormParams = {
    _id: req.params.id,
    name: req.body.name,
    userEmail: req.body.updatedBy
  };

  logger.debug("Middleware: clone form: ", {params: cloneFormParams});

  forms.cloneForm(_.extend(req.connectionOptions, cloneFormParams), formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Importing A Form From A Template
 */
function importForm(req, res, next) {
  req.appformsResultPayload = req.appformsResultPayload || {};
  var formData = (req.appformsResultPayload.data && req.appformsResultPayload.type === constants.resultTypes.formTemplate) ? req.appformsResultPayload.data : undefined ;

  var importFormParams = {
    form: formData,
    name: req.body.name,
    description: req.body.description,
    userEmail: req.user.email
  };

  logger.debug("Middleware: importForm form: ", {params: importFormParams});

  forms.cloneForm(_.extend(req.connectionOptions, importFormParams), formsResultHandlers(constants.resultTypes.forms, req, next));
}

/**
 * Get All Projects Associated With A Form
 * @param req
 * @param res
 * @param next
 */
function projects(req, res, next) {
  var params = {
    "formId": req.params.id
  };

  logger.debug("Middleware: form projects: ", {params: params});

  forms.getFormApps(_.extend(req.connectionOptions, params), formsResultHandlers(constants.resultTypes.formProjects, req, next));
}

/**
 * List All Submissions Associated With A Form
 * @param req
 * @param res
 * @param next
 */
function submissions(req, res, next) {
  var params = {
    formId: req.params.id
  };

  logger.debug("Middleware: form submissions: ", {params: params});

  forms.getSubmissions(req.connectionOptions, params, function(err, getSubmissionResponse) {
    if (err) {
      logger.error("Middleware: form submissions ", {error: err});
    }
    getSubmissionResponse = getSubmissionResponse || {};
    req.appformsResultPayload = {
      data: getSubmissionResponse.submissions,
      type: constants.resultTypes.submissions
    };

    next(err);
  });
}

/**
 * Make A Submission Against A Form
 * @param req
 * @param res
 * @param next
 */
function submitFormData(req, res, next) {
  var submission = req.body || {};

  submission.appId = req.params.projectid;
  submission.appEnvironment = req.params.environment;
  submission.deviceId = submission.deviceId || "Device Unknown";

  var submissionParams = {
    submission: submission
  };

  logger.debug("Middleware: form submitFormData: ", {params: submissionParams});

  forms.submitFormData(_.extend(submissionParams, req.connectionOptions), formsResultHandlers(constants.resultTypes.submissions, req, next));
}

module.exports = {
  list: list,
  listDeployedForms: listDeployedForms,
  search: search,
  create: create,
  get: get,
  deploy: deploy,
  update: update,
  remove: remove,
  undeploy: undeploy,
  listSubscribers: listSubscribers,
  updateSubscribers: updateSubscribers,
  clone: clone,
  projects: projects,
  submissions: submissions,
  import: importForm,
  submitFormData: submitFormData
};
