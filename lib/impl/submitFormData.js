var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var misc = require('../common/misc.js');
var formsRulesEngine = require('../common/forms-rule-engine.js');
var async = require('async');
var getForm = require('./getForm.js');
var logger = require('../common/logger.js').getLogger();
var _ = require('underscore');

var processSubmissionUpdates = require('./submitFormDataFunctions/processSubmissionUpdates');

var submitFormData = function(connections, options, cb) {
  logger.debug("submitFormData ", {options: options});

  //validate form data
  //save form data
  //return submissionId

  var resultJSON = {};
  var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);
  var Field = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);
  var FormSubmission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);

  var submissionFlags = {};
  var submissionData = options.submission || {};

  //certain fields should never be user specified
  submissionData = _.omit(submissionData, "submissionStartedTimestamp", "status", "submissionCompletedTimestamp");

  // {fieldId : validated}
  var formSubmittedAgainst;
  var formSubmission;
  var skipValidation = options.skipValidation;

  async.series([lookupSubmission, validateSubmission, saveSubmission], function(err) {
    if (err) {
      logger.error("submitFormData ", {error: err});
      resultJSON.error = err.message ? err.message : err;
    }

    if (submissionFlags.updateForm === true) {//Need to send a form definition back.
      //Should send back an updated version of the form in the response.

      var fullyPopulatedForm = formSubmittedAgainst;
      fullyPopulatedForm.lastUpdatedTimestamp = formSubmittedAgainst.lastUpdated.getTime();
      var pageAndFieldRefs = misc.generatePageAndFieldRefs(formSubmittedAgainst);
      fullyPopulatedForm.pageRef = pageAndFieldRefs.pageRef;
      fullyPopulatedForm.fieldRef = pageAndFieldRefs.fieldRef;

      resultJSON.updatedFormDefinition = fullyPopulatedForm;
    }
    if (formSubmission) {
      resultJSON.submissionId = formSubmission._id;
      resultJSON.submissionStartedTimestamp = formSubmission.submissionStartedTimestamp;
      resultJSON.formSubmission = formSubmission;

      logger.debug("submitFormData ", {resultJSON: resultJSON});
    }

    cb(undefined, resultJSON);
  });

  function lookupSubmission(cb) {
    logger.debug("submitFormData lookupSubmission", {submissionData: submissionData});
    if (submissionData._id) {
      FormSubmission.findById(submissionData._id).exec(function(err, doc) {
        formSubmission = doc;
        if (!formSubmission) {
          logger.error("submitFormData lookupSubmission", {error: "Submission not found for id '" + submissionData._id + "'"});
          return cb("Submission not found for id '" + submissionData._id + "'");
        }
        return cb();
      });
    } else {
      return cb();
    }
  }

  function saveSubmission(cb) {
    logger.debug("submitFormData saveSubmission", {submissionData: JSON.stringify(submissionData), formSubmission: JSON.stringify(formSubmission)});
    //Valid form submission definition
    if (submissionData._id === null || submissionData._id === undefined) {
      delete submissionData._id;
    }

    //If there is already a submission, it needs to be updated instead of created
    if (formSubmission) {
      formSubmission = processSubmissionUpdates(formSubmission, submissionData);
    } else {
      // create
      formSubmission = new FormSubmission(submissionData);
    }

    if (! skipValidation) {
      formSubmission.formId = formSubmittedAgainst._id;
      //note we only set this here as we do not want to change the form from an update to a submission in studio
      formSubmission.formSubmittedAgainst = formSubmittedAgainst;
      formSubmission.masterFormTimestamp = submissionFlags.masterFormTimestamp;
      formSubmission.deviceFormTimestamp = submissionFlags.deviceFormTimestamp;
    }

    //If the submission is being updated, don't set it to pending
    if (!skipValidation) {
      formSubmission.status = 'pending';
    }

    formSubmission.save(function(err, updatedForm) {
      formSubmission = updatedForm;
      return cb(err);
    });
  }

  function validateSubmission(cb) {
    async.series([validateSubmissionParams, validateSubmissionData], cb);
  }

  function validateSubmissionParams(cb) {
    var validateOptions = validate(options);

    validateOptions.has("submission", function(failure) {
      if (failure) {
        return cb(new Error("Invalid data for submission."));
      }

      var validateFormFields = validate(submissionData);
      validateFormFields.has("formId", "appId", "appCloudName", "appEnvironment", "deviceId", "deviceIPAddress", "comments", "formFields", "deviceFormTimestamp", function(failure) {
        if (failure) {
          return cb(new Error("Invalid parameters for form submission, aborting. " + JSON.stringify(failure) ));
        }

        //Have formId -- check if it exists.
        // [db-inspect] read from form db. system data but its gets its param from the submission.
        Form.findOne({"_id": submissionData.formId}, function(err, result) {
          if (err) {
            return cb(new Error("Error finding form with id " + submissionData.formId));
          }

          if (result === null) {
            return cb(new Error("No form exists with id" + submissionData.formId));
          } else {
            return cb();
          }
        });
      });
    });
  }

  function validateSubmissionData(cb) {
    //Populating the current form definition  -- get everything
    getForm(connections, {_id: submissionData.formId, expectDataSourceCache: true, showAdminFields: true}, function(err, mostRecentSubmissionForm) {
      if (err) {
        return cb(err);
      }

      //Form fields now fully populated.. time for some validation
      formSubmittedAgainst = mostRecentSubmissionForm;
      var currentFormJSON = mostRecentSubmissionForm;
      if (skipValidation) {
        return cb();
      }

      async.series([
        async.apply(checkFormForUpgrade, currentFormJSON),
        async.apply(validateDataAgainstCurrentForm, currentFormJSON),
        async.apply(setNumberFields, submissionData, currentFormJSON)
      ], cb);
    });
  }

  function setNumberFields(submission, formJson, cb) {
    //ensure any number fields are numbers validation has already occurred so we can be sure it is in fact a number
    // [db-inspect] read field db
    async.map(submission.formFields, function(f, callback) {
      Field.findOne({"_id" : f.fieldId}, function(err, fetched) {
        if (err) {
          return callback(err);
        } else if (fetched && 'number' === fetched.type) {
          for (var i=0; i < f.fieldValues.length; i++) {
            f.fieldValues[i] = parseFloat(f.fieldValues[i]);
          }
          callback(undefined,f);
        } else {
          callback(undefined,f);
        }
      });
    },cb);
  }

  function checkFormForUpgrade(currentFormJSON, cb) {

    var submitFormTimestamp = new Date(submissionData.deviceFormTimestamp);
    var masterFormTimestamp = new Date(currentFormJSON.lastDataRefresh);


    if (submitFormTimestamp === "Invalid Date" || masterFormTimestamp === "Invalid Date") {
      return cb(new Error("Invalid submission timestamp. " + submissionData.deviceFormTimestamp));
    }

    //Compare form timestamps, flag update if needed
    if (submitFormTimestamp < masterFormTimestamp) {
      submissionFlags.updateForm = true;
    }

    submissionFlags.deviceFormTimestamp = submitFormTimestamp;
    submissionFlags.masterFormTimestamp = masterFormTimestamp;

    cb();
  }

  function validateDataAgainstCurrentForm(currentFormJSON, cb) {

    if (skipValidation) {
      return cb();
    }
    var engine = formsRulesEngine(currentFormJSON);
    engine.validateForm(submissionData, formSubmission, function(err, results) {
      if (err) {
        return cb(err);
      }

      if (!results.validation.valid) {
        return cb(results.validation);
      }

      return cb();
    });
  }

};

module.exports = submitFormData;
