var async = require('async');
var models = require('../common/models.js')();
var validation = require('./../common/validate');
var groups = require('./groups.js');
var _ = require('underscore');

var Rules = {
  FIELD_RULE: 'fieldRules',
  PAGE_RULE: 'pageRules'
};

exports.updateFieldRules = updateFieldRules;
exports.updatePageRules = updatePageRules;

/*
 * updateFieldRules(connections, options, formData, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *    }
 *
 *    fieldRules: {
 *      formId: id of parent form
 *      rules: fieldrules
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function updateFieldRules(connections, options, form, fieldRules, cb) {
  var validate = validation(fieldRules);
  function validateParams(cb) {
    validate.has("formId","rules",cb);
  }
  validateParams(function(err) {
    if (err) {
      return cb(err);
    }
    groups.validateFormAllowedForUser(connections, null, form._id, function(err) {
      if (err) {
        return cb(err);
      }

      var conn = connections.mongooseConnection;
      var fieldRulesModel = models.get(conn, models.MODELNAMES.FIELD_RULE);
      doRulesUpdate(options, form, fieldRules, fieldRulesModel, Rules.FIELD_RULE, cb);
    });
  });
}

/*
 * updatePageRules(connections, options, formData, cb)
 *
 *    connections: {
 *       mongooseConnection: ...
 *    }
 *
 *    options: {
 *       uri:       db connection string,
 *       userEmail: user email address string
 *    }
 *
 *    pageRules: {
 *      formId: id of parent form
 *      rules: pagerules
 *    }
 *
 *    cb  - callback function (err)
 *
 */

function updatePageRules(connections, options, form, pageRules, cb) {
  var validate = validation(pageRules);
  function validateParams(cb) {
    validate.has("formId","rules",cb);
  }
  validateParams(function(err) {
    if (err) {
      return cb(err);
    }
    groups.validateFormAllowedForUser(connections, null, form._id, function(err) {
      if (err) {
        return cb(err);
      }
      var conn = connections.mongooseConnection;
      var pageRulesModel = models.get(conn, models.MODELNAMES.PAGE_RULE);
      doRulesUpdate(options, form, pageRules, pageRulesModel, Rules.PAGE_RULE, cb);
    });
  });
}

function doRulesUpdate(options, form, rules, rulesModel, ruleType, cb) {

  // iterate through the form field rules vs the new rules
  function createRules(rulesToCreate, cb) {

    function addRule(ruleToCreate, addRuleCallback) {
      var fr = new rulesModel(ruleToCreate);

      fr.save(function(err, frdoc) {
        if (err) {
          return addRuleCallback(err);
        }
        return addRuleCallback(null, frdoc);
      });
    }

    async.map(rulesToCreate, addRule, cb);
  }

  var updatedRules = rules.rules;

  var rulesToCreate = _.filter(updatedRules, function(ruleDetails) {
    return !ruleDetails._id;
  });

  var rulesToDelete = _.filter(form[ruleType], function(formRuleDetails) {
    return !_.find(updatedRules, function(ruleDetails) {

      return (ruleDetails._id && _.isEqual(formRuleDetails._id.toString(), ruleDetails._id.toString()));
    });
  });

  var rulesToUpdate = _.filter(updatedRules, function(ruleDetails) {
    return (ruleDetails._id && !_.find(rulesToDelete, function(ruleToDelete) {
      return _.isEqual(ruleToDelete._id.toString(), ruleDetails._id.toString());
    }));
  });

  // process any updates
  function updateRules(rulesToUpdate, cb) {
    function updateRule(ruleDetails, cb1) {
      var id = ruleDetails._id;
      // [db-inspect] read and write rules
      rulesModel.findOne({_id: id}, function(err, ruleToUpdate) {
        if (err) {
          return cb1(err);
        }

        if (ruleToUpdate === null && !options.createIfNotFound) {
          return cb1(new Error("No " + ruleType + " rule matches id " + id));
        } else if (ruleToUpdate === null && options.createIfNotFound) {
          ruleToUpdate = new rulesModel(ruleDetails);
        }

        for (var saveKey in ruleDetails) { // eslint-disable-line guard-for-in
          ruleToUpdate[saveKey] = ruleDetails[saveKey];
        }

        ruleToUpdate.save(cb1);
      });
    }

    async.map(rulesToUpdate, updateRule, cb);
  }

  // process any deletes
  function deleteRules(rulesToDelete, cb) {
    var idsToRemove = _.pluck(rulesToDelete, "_id");

    function deleteRule(fieldRuleId, cb1) {
      rulesModel.findByIdAndRemove(fieldRuleId, cb1);
    }
    async.each(idsToRemove, deleteRule, cb);
  }


  async.series({
    deleteRules: function(cb1) {
      deleteRules(rulesToDelete, cb1);
    },
    createRules: function(cb1) {
      createRules(rulesToCreate, cb1);
    },
    updateRules: function(cb1) {
      updateRules(rulesToUpdate, cb1);
    }
  }, function(err, results) {
    if (err) {
      return cb(err);
    }

    var allRules = _.union(results.createRules, results.updateRules);

    form[ruleType] = allRules;

    cb();

  });
}
