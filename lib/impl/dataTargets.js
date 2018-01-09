var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var misc = require('../common/misc.js');
var buildErrorResponse = misc.buildErrorResponse;
var async = require('async');
var _ = require('underscore');
var ERROR_CODES = models.CONSTANTS.ERROR_CODES;
var CONSTANTS = {
  "DATA_TARGET_ID": "_id",
  "FORM_ID": "_id",
  "FORM_NAME": "name"
};

//TODO Logging

//Helper function to remove any invalid data types from incoming json.
function sanitiseJSON(jsonToSanitise) {
  return _.pick(jsonToSanitise, function(val) {
    return !_.isFunction(val);
  });
}

// [db-inspect] reads from the db.
function lookUpDataTargets(connections, params, cb) {
  if (!params) {
    return cb(new Error("No Search Parameters For Finding Data Targets"));
  }

  //Some queries don't want a document, just want a Javascript Object.
  params.lean = params.lean ? params.lean : false;

  var DataTarget = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_TARGET);

  //Looking To Find A Data Target - Just Want The Object
  DataTarget.find(params.query).lean(params.lean).exec(function(err, dataTargets) {
    if (err) {
      return cb(err);
    }

    return cb(undefined, dataTargets);
  });
}

// [db-inspect] read from the db.
function checkFormsUsingDataTarget(connections, dataTargetJSON, cb) {
  //Need To List Any Forms That Are Using The Data Target
  var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);

  var selections = {

  };

  //Only need the form name and id.
  selections[CONSTANTS.FORM_ID] = 1;
  selections[CONSTANTS.FORM_NAME] = 1;

  //Only want the JSON definition of the forms, don't need documents
  Form.find({dataTargets: dataTargetJSON[CONSTANTS.DATA_TARGET_ID]}).lean().select(selections).exec(function(err, formsUsingDataTarget) {
    if (err) {
      return cb(buildErrorResponse({
        error: err,
        code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
      }));
    }

    dataTargetJSON.forms = formsUsingDataTarget || [];

    //Have All The Information Needed For The Data Target
    return cb(undefined, dataTargetJSON);
  });
}

/**
 * Get A Specific Data Target Definition
 * @param connections
 * @param params
 * @param cb
 */
function get(connections, params, cb) {
  var failed = validate(params).has(CONSTANTS.DATA_TARGET_ID);

  if (failed) {
    return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Get A Data Target"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  if (!misc.checkId(params._id)) {
    return cb(buildErrorResponse({error: new Error("Invalid ID Paramter"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  async.waterfall([
    function findDataTargets(cb) {
      var query = {

      };

      //Searching By ID.
      query[CONSTANTS.DATA_TARGET_ID] = params._id;

      lookUpDataTargets(connections, {
        query: query,
        lean: true
      }, function(err, dataTargets) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Searching For A Data Target",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        //Checking if the Data Target exists. Should be only one
        if (dataTargets.length !== 1) {
          return cb(buildErrorResponse({
            error: new Error("Data Target Not Found"),
            systemDetail: "Requested ID: "  + params[CONSTANTS.DATA_TARGET_ID],
            code: ERROR_CODES.FH_FORMS_NOT_FOUND
          }));
        }

        return cb(undefined, dataTargets[0]);
      });
    },
    function checkForms(dataTargetJSON, cb) {
      //Checking For Any Forms Associated With The Data Target
      checkFormsUsingDataTarget(connections, dataTargetJSON, cb);
    }
  ], cb);
}


/**
 * Removing A Data Target
 * @param connections
 * @param params
 * @param cb
 */
// [db-inspect] delete from db.
function remove(connections, params, cb) {
  var failed = validate(params).has(CONSTANTS.DATA_TARGET_ID);

  if (failed) {
    return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Remove A Data Target"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  if (!misc.checkId(params._id)) {
    return cb(buildErrorResponse({error: new Error("Invalid ID Paramter"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
  }

  async.waterfall([
    function findAssociatedForms(cb) {
      checkFormsUsingDataTarget(connections, params, cb);
    },
    function verifyNoFormsAssociated(updatedDataTarget, cb) {
      //If there is more than one form using this data target, then do not delete it.

      if (updatedDataTarget.forms.length > 0) {
        return cb(buildErrorResponse({
          error: new Error("Forms Are Associated With This Data Target. Please Disassociate Forms From This Data Target Before Deleting."),
          code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
        }));
      }

      return cb(undefined, updatedDataTarget);
    },
    function processResponse(updatedDataTarget, cb) {
      //Removing The Data Target
      var DataTarget = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_TARGET);

      DataTarget.remove({_id: updatedDataTarget._id}, function(err) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Removing A Data Target",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        //Data Target Removed Successfully
        return cb();
      });
    }
  ], cb);

}

/**
 * Listing All Data Targets. In The Environment, this will include the current cache data.
 * @param connections
 * @param params
 * @param cb
 */
function list(connections, params, cb) {
  async.waterfall([
    function findDataTargets(cb) {
      lookUpDataTargets(connections, {
        query: {},
        lean: true
      }, function(err, dataTargets) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Searching For A Data Target",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        return cb(undefined, dataTargets);
      });
    }
  ], cb);
}

function update(connections, dataTarget, cb) {
  async.waterfall([
    function validateParams(cb) {
      var dataTargetValidator = validate(dataTarget);
      //The Data Target parameter should have an ID property.
      dataTargetValidator.has(CONSTANTS.DATA_TARGET_ID, function(err) {
        if (err) {
          return cb(buildErrorResponse({error: new Error("An ID Parameter Is Required To Update A Data Target"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
        }

        cb(undefined, dataTarget);
      });
    },
    function findDataTarget(dataTarget, cb) {
      var query = {

      };

      //Searching By ID.
      query[CONSTANTS.DATA_TARGET_ID] = dataTarget._id;

      //Looking up a full Data Target document as we are updating
      lookUpDataTargets(connections, {
        query: query,
        lean: false
      }, function(err, dataTargets) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Unexpected Error When Searching For A Data Target",
            code: ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR
          }));
        }

        //Should only be one Data Target
        if (dataTargets.length !== 1) {
          return cb(buildErrorResponse({
            error: new Error("Data Target Not Found"),
            systemDetail: "Requested ID: "  + dataTarget._id,
            code: ERROR_CODES.FH_FORMS_NOT_FOUND
          }));
        }

        return cb(undefined, dataTarget, dataTargets[0]);
      });
    },
    function updateDataTarget(dataTargetJSON, dataTargetDocument, cb) {
      //Updating The Data Target Document.

      //The Data Target shout not contain any functions.
      dataTargetJSON = sanitiseJSON(dataTargetJSON);

      //Can't update the docuemnt ID field.
      delete dataTargetJSON[CONSTANTS.DATA_TARGET_ID];

      dataTargetDocument = _.extend(dataTargetDocument, dataTargetJSON);

      //Marking The Data Target As Having Been Updated
      dataTargetDocument.lastUpdated = new Date();

      dataTargetDocument.save(function(err) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Invalid Data Target Update Data.",
            systemDetail: err.errors,
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          }));
        }

        return cb(undefined, dataTargetDocument.toJSON());
      });
    },
    function checkForms(dataTargetJSON, cb) {
      //Checking For Any Forms Associated With The Data Target
      checkFormsUsingDataTarget(connections, dataTargetJSON, cb);
    }
  ], cb);
}

/**
 * Creating A New Data Target
 * @param connections
 * @param dataTarget
 * @param cb
 */
// [db-inspect] writes a data target to the db.
function create(connections, dataTarget, cb) {
  async.waterfall([
    function validateParams(cb) {
      validate(dataTarget).hasno(CONSTANTS.DATA_TARGET_ID, function(err) {
        if (err) {
          return cb(buildErrorResponse({error: new Error("Data Target ID Should Not Be Included When Creating A Data Target"), code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS}));
        }
      });

      cb(undefined, dataTarget);
    },
    function createDataTarget(dataTargetJSON, cb) {
      dataTargetJSON = sanitiseJSON(dataTargetJSON);

      var DataTarget = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_TARGET);
      var newDataTarget = new DataTarget(dataTargetJSON);

      newDataTarget.save(function(err) {
        if (err) {
          return cb(buildErrorResponse({
            error: err,
            userDetail: "Invalid Data Target Creation Data.",
            systemDetail: err.errors,
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
          }));
        }

        return cb(undefined, newDataTarget.toJSON());
      });

    }
  ], cb);
}

/**
 * Validating A Data Target Object.
 * @param connections
 * @param dataTarget
 * @param cb
 */
function validateDataTarget(connections, dataTarget, cb) {
  var DataTarget = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_TARGET);
  var testDataTarget = new DataTarget(dataTarget);
  //Validating Without Saving
  testDataTarget.validate(function(err) {
    if (err) {
      return cb(buildErrorResponse({
        error: err,
        userDetail: "Invalid Data Target Creation Data.",
        systemDetail: err.errors,
        code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS
      }));
    }

    return cb(undefined, dataTarget);
  });
}

module.exports = {
  get: get,
  list: list,
  update: update,
  create: create,
  validate: validateDataTarget,
  remove: remove
};
