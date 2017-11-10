var csvGeneration = require('./csvValues');
var csvHeaders = require('./csvHeaders');
var _ = require('underscore');
var sectionUtils = require('../../utils/sectionsUtils');


/**
 * getSubmissionFormField - Helper function to see if a submission contains a form field (which we get from the form itself)
 *
 * @param  {object} submission  Submission JSON definition
 * @param  {type} formField     Field definition to search for.
 * @return {object}             Found Field or undefined
 */
function getSubmissionFormField(submission, formField) {
  return _.find(submission.formFields, function(subField) {
    var fieldId = subField.fieldId.toString();
    return fieldId === formField._id.toString();
  });
}


function generateRepeatingSectionCSV(section, mergedFields, submittedFields) {
  var fieldsInSection = sectionUtils.getFieldsInSection(section._id, _.values(mergedFields));
  var renderData = [];
  var idsOfFieldsInTheSection = [];


  _.each(fieldsInSection, function(fieldInSection) {
    idsOfFieldsInTheSection.push(fieldInSection._id);

    var thisFieldInSection = _.filter(submittedFields, function(subField) {
      return subField.fieldId.toJSON() === fieldInSection._id;
    });

    _.each(thisFieldInSection, function(thisField) {
      if (!renderData[thisField.sectionIndex]) {
        renderData[thisField.sectionIndex] = [];
      }
      renderData[thisField.sectionIndex].push({fieldModel:fieldInSection, fieldValuesInSections: thisField});
    });

  });
  // need to fill up empty data for fields to max repeat of the section
  for (var i = 0; i < section.fieldOptions.definition.maxRepeat; i++) {
    var dataForIndex = renderData[i];

    if (!dataForIndex) {
      renderData[i] = [];
      for (var j = 0; j < fieldsInSection.length; j++) {
        var tempEmptyObject = {fieldModel:_.clone(fieldsInSection[j]),fieldValuesInSections: []};
        renderData[i].push(tempEmptyObject);
      }
    }
  }


  renderData = _.flatten(renderData);

  return {data: renderData, idsOfFieldsInSection: idsOfFieldsInTheSection};
}

/**
 * processSingleSubmission - Processing A Single Submission Against The Merged Form
 *
 * @param  {object} params
 * @param  {object} params.submission   A full submission JSON definition
 * @param  {object} params.mergedFields A set of merged fields from different versions of the form.
 * @param  {string} params.downloadUrl  The download URL template to use for generating file URLs
 * @return {type}        description
 */
module.exports = function processSingleSubmission(params) {
  //Submission To Export
  var sub = params.submission;

  //CSV Line definition
  var line = '';

  //Keeping the string version
  sub._id = sub._id.toString();
  sub.formName = sub.formSubmittedAgainst.name;
  //Merged field definitions
  var mergedFields = params.mergedFields;

  //Download Url For Files
  var downloadUrl = params.downloadUrl;

  //ID Of The Form Submitted Against
  sub.formId = sub.formId.toString();

  var mergedFieldEntries = mergedFields[sub.formId];

  // Add metaDataHeaders values first
  line = csvHeaders.addMetadataValues(line, sub);

  mergedFieldEntries = mergedFields[sub.formId];

  var fieldsProcessed = [];
  var repeatingSectionData = {};
  //For each merged field entry, add the relevant field values from the submission.
  _.each(mergedFieldEntries, function(field) {

    if (field.type === 'sectionBreak' && field.repeating) {
      repeatingSectionData = generateRepeatingSectionCSV(field, mergedFieldEntries, sub.formFields);
      var sectionStr = '';
      // need to add max repeat for every row.
      // dont need section there, just a field name/code + sectionIndex+1
      fieldsProcessed = fieldsProcessed.concat(repeatingSectionData.idsOfFieldsInSection);

      for (var i = 0; i < repeatingSectionData.data.length; i++) {
        var fieldModel = repeatingSectionData.data[i].fieldModel;
        var fieldValuesInSections = repeatingSectionData.data[i].fieldValuesInSections || {fieldValues: []};
        sectionStr += csvGeneration.generateCSVFieldValues(fieldModel, fieldValuesInSections, downloadUrl, sub);
      }

      line += sectionStr;
    } else if (fieldsProcessed.indexOf(field._id) === -1) {
      //Getting the submission values
      var fieldValues = getSubmissionFormField(sub, field);

      //Adding the CSV values to the line.
      line += csvGeneration.generateCSVFieldValues(field, fieldValues, downloadUrl, sub);
    }
  });

  //The generation process will always produce an extra , at the end. Can be cut off.
  line = line.slice(0, -1);
  line += '\r\n';
  return line;
};
