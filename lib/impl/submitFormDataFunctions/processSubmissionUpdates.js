var _ = require('underscore');

var save  = function(formSubmission, existingFieldData) {
  if (_.isFunction(existingFieldData.markModified)) {
    existingFieldData.markModified('fieldValues');
  } else {
    //If it's not a mongoose documents, just need to add the new values.
    formSubmission.formFields.push(existingFieldData);
  }
};

module.exports = function processSubmissionUpdates(formSubmission, submissionData) {
  formSubmission.formSubmittedAgainst = formSubmission.formSubmittedAgainst || {};

  var allFields = _.map(formSubmission.formSubmittedAgainst.pages, function(page) {
    return page.fields || [];
  });
  allFields = _.compact(_.flatten(allFields));

  // for all field definitions
  _.each(allFields, function(fieldDef) {
    // check against every submitted field, there might be more fields with the same id (repeating sections)
    _.each(submissionData.formFields, function(updatedField) {
      var updatedFieldId = updatedField.fieldId.toString();
      var fieldDefId = fieldDef._id.toString();

      if (updatedField.fieldId.toString() === fieldDef._id.toString()) {
        var missingSection = false;
        var sameId = false;
        var sameIdField = null;

        var existingFieldData = _.find(formSubmission.formFields, function(existingField) {
          var existingFieldId = existingField.fieldId.toString();
          sameId = existingFieldId === updatedFieldId;
          sameIdField = sameId ? existingField : null;
          var sameSection = existingField.sectionIndex === updatedField.sectionIndex;
          missingSection = existingField.sectionIndex === 0 && !updatedField.sectionIndex;

          //exact match for field id and its section index
          return sameId && sameSection;
        });

        if (existingFieldData) {
          existingFieldData.fieldValues = updatedField.fieldValues ;
          save(formSubmission, existingFieldData);
        } else if (missingSection && sameId && sameIdField) {
          // back compatibility, in case when updated field has no sectionIndex and existing field has
          // section index equal 0 (mongoose default)
          sameIdField.fieldValues = updatedField.fieldValues;
          save(formSubmission, sameIdField);
        } else if (fieldDefId === updatedFieldId) {
          // last check - updated field is in the field definitions but had no previous data submitted.
          save(formSubmission, updatedField);
        }
      }
    });
  });

  return formSubmission;
};