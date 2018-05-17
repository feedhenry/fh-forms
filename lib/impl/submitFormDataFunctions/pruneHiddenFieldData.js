var _ = require('underscore');
var rulesEngine = require('../../common/forms-rule-engine');
/**
 *
 * Getting the IDs of all fields that have been hidden.
 *
 * @param {object} actions  -  The rule actions from the rules engine.
 * @param {object} formDefinition - The full form JSON definition
 * @returns {Array}  - Array of field IDs hidden by the rules.
 */
function getHiddenFieldIDs(actions, formDefinition) {
  var ruleTypes = ["fields", "pages"];
  //For page and field rule actions, find the hidden fields.
  var allHiddenFieldIds = _.map(ruleTypes, function(ruleType) {
    var fieldIds = [];
    var hidden = _.map(actions[ruleType] || {}, function(ruleAction, fieldOrPageId) {
      if (ruleAction.action === 'hide') {
        return fieldOrPageId;
      } else {
        return null;
      }
    });
    //If it is a hidden page, need to check for all fields that are in the page.
    //All of these fields are considered hidden.
    if (ruleType === 'pages') {
      fieldIds = _.map(hidden, function(pageId) {
        var pageDefinition = _.findWhere(formDefinition.pages, {_id: pageId}) || {};
        return _.pluck(pageDefinition.fields || [], "_id");
      });
    } else {
      fieldIds = hidden;
    }
    return _.compact(_.flatten(fieldIds));
  });
  return _.flatten(allHiddenFieldIds);
}

/**
 * Function for save empty data for any values from a submisson that in hidden fields.
 * @param {object} formDefinition
 * @param {object} submissionData
 * @param {function} cb - Callback function
 * @returns {*}
 */
module.exports = function pruneHiddenFieldData(formDefinition, submissionData, cb) {
  var formRulesEngine = rulesEngine(formDefinition);
  //Checking if the fieldId was populated with a Field model
  submissionData.formFields = _.map(submissionData.formFields, function(formField) {
    if (formField.fieldId && formField.fieldId._id) {
      formField.fieldId = formField.fieldId._id;
    }
    //Converting to a string if it was an ObjectID for comparision.
    formField.fieldId = formField.fieldId.toString();
    return formField;
  });
  //Checking if the formField is a hiddenField
  function isHidden(formField, allHiddenFieldIds) {
    return formField.fieldId && _.find(allHiddenFieldIds, function(hiddenFieldId) {
      if (hiddenFieldId.indexOf('_') < 0) {
        return hiddenFieldId.toString() === formField.fieldId.toString();
      } else {
        return hiddenFieldId.toString() === (formField.fieldId.toString() + '_' + formField.sectionIndex);
      }
    });
  }
  formRulesEngine.checkRules(submissionData, function(err, ruleState) {
    if (err) {
      return cb(err);
    }
    var allHiddenFieldIds = getHiddenFieldIDs(ruleState.actions, formDefinition);
    //Save empty data for fields which are hidden.
    _.each(submissionData.formFields, function(formField) {
      formField = formField || {};
      if ( isHidden(formField, allHiddenFieldIds) ) {
        formField.fieldValues = [];
      }
    });
    return cb(undefined, submissionData);
  });
};