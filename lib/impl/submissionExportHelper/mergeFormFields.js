var _ = require('underscore');
var CONSTANTS = require('../../common/constants');


/**
 * mergeFormFields - Merging the form field definitions between different definitions of the form.
 *
 * Submissions may have been made against different versions of the form. This has to be taken account of when exporting submissions.
 *
 * @param  {object} mergedFields Current merged field definitions
 * @param  {object} formToMerge  Form JSON definition
 * @return {type}              Updated Merged field definitions.
 */
module.exports = function mergeFormFields(mergedFields, formToMerge) {
  if (!formToMerge) {
    return null;
  }

  mergedFields = mergedFields || {};

  _.each(formToMerge.pages || [], function(page) {
    _.each(page.fields || [], function(field) {

      //Don't want to add any invalid field types to the merged form.
      if (!mergedFields[field._id] &&
          CONSTANTS.FORM_CONSTANTS.FIELD_TYPE_MATRIX !== field.type) {
        mergedFields[field._id] = field;
      }

      //If the field is repeating and the merged field is not, the mergedField should be switched
      var mergedFieldRepeating = mergedFields[field._id] && mergedFields[field._id].repeating;
      if (field.repeating && !mergedFieldRepeating) {
        mergedFields[field._id] = field;
      }

      //If the field max repeat values are larger, then swap it out.
      if (field.repeating && mergedFields[field._id].repeating &&
        field.fieldOptions.definition.maxRepeat > mergedFields[field._id].fieldOptions.definition.maxRepeat) {
        mergedFields[field._id] = field;
      }
    });
  });

  return mergedFields;
};
