var async = require('async');
var getSectionMap = require('../utils/get-section-map');
var _ = require('underscore');
var models = require('../common/models.js')();

/*
  Checking rule targets are still valid -- if not, rule is deleted
*/
module.exports = function refactorRules(connections, form, ruleDeletionFlags, cb) {
  //Compiling a list of field and page ids to check for
  var formPages = [];
  var fieldRulesToDelete = [];
  var pageRulesToDelete = [];

  /**
   * Object of invalid fields that is built up by scanning the rules.
   * @type {{
   *   fieldId: true
   * }}
   */
  var invalidFields = {

  };

  //If a rule contains a field that is flagged for rule deletion, it is added to this list.
  // Invalid field rules with fields within repeating section are also added to this list.
  var rulesFlaggedForDeletion = {};

  // Mapping of field ids to their sections - needed for checking rules with repeating sections.
  var fieldSectionMapping;

  var conn = connections.mongooseConnection;
  var formModel = models.get(conn, models.MODELNAMES.FORM);
  var fieldModel = models.get(conn, models.MODELNAMES.FIELD);
  var fieldRuleModel = models.get(conn, models.MODELNAMES.FIELD_RULE);
  var pageRuleModel = models.get(conn, models.MODELNAMES.PAGE_RULE);
  // [db-inspect] read from form db
  formModel.findById(form._id.toString()).populate("pages", "-__v")
    .populate("pageRules", "-__v")
    .populate("fieldRules", "-__v")
    .populate("dataSources.formDataSources", "_id name")//Populating Data Sources
    .populate("dataTargets", "_id name")//Populating Data Targets
    .select("-__v").exec(function(err, formResult) {
      if (err) {
        return cb(err);
      }

      //Now have a form with all pages, pageRules and fieldRules populated
      formModel.populate(formResult, {
        "path": "pages.fields",
        "model": fieldModel,
        "select": "-__v"
      }, function(err, updatedFormResult) {
        if (err) {
          return cb(err);
        }

        form = updatedFormResult;

        formPages = updatedFormResult.pages;

        async.parallel([
          function(fieldRuleCb) {
            async.each(formResult.fieldRules, async.apply(scanForInvalidFields, models.MODELNAMES.FIELD_RULE), fieldRuleCb);
          },
          function(pageRuleCb) {
            async.each(formResult.pageRules, async.apply(scanForInvalidFields, models.MODELNAMES.PAGE_RULE), pageRuleCb);
          }
        ], function(err) {
          if (err) {
            return cb(err);
          }

          checkRulesWithRepeatingSections();

          //Update the form object
          async.series([
            updateFormRules,
            updateOrDeleteRules
          ], cb);
        });
      });
    });


  function scanForInvalidFields(type, rule, callback) {
    var targetField = rule.targetPage ? rule.targetPage : rule.targetField;
    /**
     * A field target is not valid if it does not exist in the form or it is an adminOnly field.
     * @param fieldOrPageIdToCheck
     * @param pages
     * @returns {boolean}
     */
    function isFieldStillValidTarget(fieldOrPageIdToCheck, pages, cb) {
      var fieldExistsInForm = false;
      var invalidPages = _.filter(pages, function(page) {
        var currentPageId = page._id.toString();

        if (currentPageId === fieldOrPageIdToCheck) {
          fieldExistsInForm = true;
        }
        var invalidFieldList = _.filter(page.fields, function(field) {
          var currentFieldId = field._id.toString();
          if (currentFieldId === fieldOrPageIdToCheck) {
            //Current field exists
            fieldExistsInForm = true;

            //Field is admin only, therefore it is an invalid target for a rule.
            if (field.adminOnly) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        });

        //If the invalidFieldList is > 0, it means that one of the fields was invalid.
        return invalidFieldList.length > 0;
      });

      var invalidField = invalidPages.length > 0;

      //Invalid if either the field is invalid, or it does not exist in the form.
      if (invalidField === true || !fieldExistsInForm) {
        return cb(true);
      } else {
        return cb();
      }
    }

    async.each(targetField, function(targetField, cb) {
      targetField = targetField.toString();

      //Checking if the field target field is invalid
      isFieldStillValidTarget(targetField, formPages, function(invalidField) {
        if (invalidField) {
          invalidFields[targetField] = true;
        }
        return cb();
      });
    }, function() {
      async.each(rule.ruleConditionalStatements, function(ruleConStatement, ruleCb) {
        var sourceId = ruleConStatement.sourceField;
        sourceId = sourceId.toString();

        isFieldStillValidTarget(sourceId, formPages, function(invalidField) {
          if (invalidField) {
            invalidFields[sourceId] = true;
          }
          ruleCb();
        });
      }, callback);
    });
  }

  function checkRulesWithRepeatingSections() {
    // Map field ids to actual fields
    var fieldIdMapping = {};
    form.pages.forEach(function(page) {
      page.fields.forEach(function(field) {
        fieldIdMapping[field._id.toString()] = field;
      });
    });

    // Map field ids to it's sections
    fieldSectionMapping = getSectionMap(form);
    fieldSectionMapping = _.mapObject(fieldSectionMapping, function(sectionId) {
      return fieldIdMapping[sectionId];
    });

    checkFieldRulesWithRepeatingSections();
    checkPageRulesWithRepeatingSections();
  }

  /**
   * Get ids of repeating sections with fields which act as sources in a rule
   * @param rule
   * @returns {String[]}
   */
  function getSourceRepeatingSections(rule) {
    return _.chain(rule.ruleConditionalStatements)
      .map(function(ruleConditionalStatement) {
        var sourceId = ruleConditionalStatement.sourceField.toString();
        return fieldSectionMapping[sourceId];
      })
      .filter(function(section) {
        return section && section.repeating;
      })
      .map(function(repeatingSection) {
        return repeatingSection._id.toString();
      })
      .uniq()
      .value();
  }

  function checkPageRulesWithRepeatingSections() {
    form.pageRules.forEach(function(pageRule) {
      var sectionIds = getSourceRepeatingSections(pageRule);

      if (sectionIds.length > 0) {
        // there is source field in repeating section
        rulesFlaggedForDeletion[pageRule._id.toString()] = true;
      }
    });
  }

  function checkFieldRulesWithRepeatingSections() {
    form.fieldRules.forEach(function(fieldRule) {
      var sectionIds = getSourceRepeatingSections(fieldRule);

      if (sectionIds.length > 1) {
        // there are more source fields in different repeating sections
        rulesFlaggedForDeletion[fieldRule._id.toString()] = true;
      } else if (sectionIds.length === 1) {
        // all source fields within repeating section are in the same section
        // -> check that all target fields are in that same section
        var targetInDifferrentSection = _.find(fieldRule.targetField, function(targetField) {
          var targetSection = fieldSectionMapping[targetField.toString()];
          var targetSectionId = targetSection && targetSection._id.toString();
          return targetSectionId !== sectionIds[0];
        });
        if (targetInDifferrentSection) {
          rulesFlaggedForDeletion[fieldRule._id.toString()] = true;
        }
      }
    });
  }

  function updateOrDeleteRules(cb) {
    //Updating each of the rules to account for any fields removed. Can't just simply delete them.
    // [db-inspect] read and write to the field rule db
    async.parallel([
      function updateFieldRulesInDb(cb) {
        async.each(form.fieldRules, function(formFieldRule, cb) {
          var fieldRuleId = formFieldRule._id.toString();
          fieldRuleModel.findOne({"_id": fieldRuleId}, function(err, fieldRule) {
            if (err) {
              return cb(err);
            }

            if (fieldRule === null) {
              return cb(new Error("No field rule with id " + fieldRuleId + " found."));
            }

            //Update the ruleConditionalStatements and targets of the rule.
            fieldRule.ruleConditionalStatements = formFieldRule.ruleConditionalStatements;
            fieldRule.targetField = formFieldRule.targetField;
            fieldRule.save(cb);
          });
        }, cb);
      },
      function updatePageRulesInDb(cb) {
        async.each(form.pageRules, function(formPageRule, cb) {
          var pageRuleId = formPageRule._id.toString();
          pageRuleModel.findOne({"_id": pageRuleId}, function(err, pageRule) {
            if (err) {
              return cb(err);
            }

            if (pageRule === null) {
              return cb(new Error("No page rule with id " + pageRuleId + " found."));
            }

            //Update the ruleConditionalStatements and targets of the rule.
            pageRule.ruleConditionalStatements = formPageRule.ruleConditionalStatements;
            pageRule.save(cb);
          });
        }, cb);
      },
      // [db-inspect] delete from field rule db
      function deleteFieldRules(cb) {
        async.eachSeries(fieldRulesToDelete, function(fieldRuleId, cb) {
          fieldRuleModel.findOne({"_id": fieldRuleId}, function(err, fieldRule) {
            if (err) {
              return cb(err);
            }

            if (fieldRule !== null) {
              fieldRule.remove(cb);
            } else {
              return cb();
            }
          });
        }, cb);
      },
      // [db-inspect] delete from page rules db
      function deletePageRules(cb) {
        async.eachSeries(pageRulesToDelete, function(pageRuleId, cb) {
          pageRuleModel.findOne({"_id": pageRuleId}, function(err, pageRule) {
            if (err) {
              return cb(err);
            }

            if (pageRule !== null) {
              pageRule.remove(cb);
            } else {
              return cb();
            }
          });
        }, cb);
      }
    ], cb);
  }

  //Need to delete any rules that are to be deleted
  function updateFormRules(cb) {

    //Filters out any conditional statements that are no longer valid.
    function filterConditionalStatements(rule) {
      return _.filter(rule.ruleConditionalStatements, function(ruleCondStatement) {
        var sourceField = ruleCondStatement.sourceField.toString();

        if (invalidFields[sourceField]) {
          /**
           * If the user flagged the field in this rule for deletion, flag the rule for deletion.
           */
          if (ruleDeletionFlags[sourceField]) {
            rulesFlaggedForDeletion[rule._id.toString()] = true;
          }
          return false;
        } else {
          return true;
        }
      });
    }

    var updatedFieldRules = _.map(form.fieldRules, function(fieldRule) {
      var filteredConditionalStatements = filterConditionalStatements(fieldRule);
      var filteredTargets = _.filter(fieldRule.targetField, function(targetField) {
        if (invalidFields[targetField]) {
          return false;
        } else {
          return true;
        }
      });

      fieldRule.ruleConditionalStatements = filteredConditionalStatements;
      fieldRule.targetField = filteredTargets;
      return fieldRule;
    });

    var updatedPageRules = _.map(form.pageRules, function(pageRule) {
      pageRule.ruleConditionalStatements = filterConditionalStatements(pageRule);
      return pageRule;
    });

    fieldRulesToDelete = _.filter(updatedFieldRules, function(fieldRule) {
      var targetFields = fieldRule.targetField;
      var conditionalStatements = fieldRule.ruleConditionalStatements;
      var fieldRuleId = fieldRule._id.toString();

      return targetFields.length === 0 || conditionalStatements.length === 0 || rulesFlaggedForDeletion[fieldRuleId];
    });

    pageRulesToDelete = _.filter(updatedPageRules, function(pageRule) {
      var conditionalStatements = pageRule.ruleConditionalStatements;
      var pageRuleId = pageRule._id.toString();

      return conditionalStatements.length === 0 || rulesFlaggedForDeletion[pageRuleId];
    });

    fieldRulesToDelete = _.map(fieldRulesToDelete, function(fieldRule) {
      return fieldRule._id.toString();
    });

    pageRulesToDelete = _.map(pageRulesToDelete, function(pageRule) {
      return pageRule._id.toString();
    });

    //Now have all the rules that need to be deleted, these rules need to be removed from the field and page rules
    updatedFieldRules = _.filter(updatedFieldRules, function(updatedFieldRule) {
      return fieldRulesToDelete.indexOf(updatedFieldRule._id.toString()) === -1;
    });


    updatedPageRules = _.filter(updatedPageRules, function(updatedPageRule) {
      return pageRulesToDelete.indexOf(updatedPageRule._id.toString()) === -1;
    });

    form.fieldRules = updatedFieldRules;
    form.pageRules = updatedPageRules;

    form.save(function(err) {
      return cb(err);
    });
  }
};
