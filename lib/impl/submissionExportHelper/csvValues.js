var fieldTypeUtils = require('./fieldTypeUtils');
var csvStr = require('./csvStringFromValue');
var misc = require('../../../lib/common/misc');

/**
 * generateCSVSingleValue - Generating A Single Value For A Field
 *
 * @param  {object} field       Field Definition To Generate A CSV For
 * @param  {object/string/number} val         Field Value
 * @param  {string} downloadUrl URL template for downloading files
 * @param  {object} submissionId         Submission ID
 * @return {type}             description
 */
function generateCSVSingleValue(field, val, downloadUrl, submissionId) {
  var line = '';
  var fieldValue = val;
  if (!(typeof (fieldValue) === 'undefined' || fieldValue === null)) {
    //Value is something, add the value
    if (field.type === 'checkboxes') {
      fieldValue = val.selections;
    } else if (fieldTypeUtils.isFileType(field.type)) {
      //File types have two fields, a name and url to be added
      if (val.fileName) {
        fieldValue = val.fileName;
      } else {
        fieldValue = '<not uploaded>';
      }
    } else if (fieldTypeUtils.isBarcodeType(field.type)) {
      if (val.format) {
        fieldValue = val.format;
      } else {
        fieldValue = "<not set>";
      }
    }
    line += csvStr(fieldValue);
    line += ',';

    //If it is a file type, then the url should also be added
    if (fieldTypeUtils.isFileType(field.type)) {
      if (val.groupId) {
        fieldValue = downloadUrl.replace(":id", submissionId).replace(":fileId", val
          .groupId);
      } else {
        fieldValue = '<not uploaded>';
      }

      line += csvStr(fieldValue);
      line += ',';
    } else if (fieldTypeUtils.isBarcodeType(field.type)) {
      if (val.text) {
        fieldValue = val.text;
      } else {
        fieldValue = "<not set>";
      }
      line += csvStr(fieldValue);
      line += ',';
    }

  } else {
    //No value, spacers have to be added.

    //For file type, the file name and url are included. Therefore blank values have to be spaced twice.
    if (fieldTypeUtils.isFileType(field.type) || fieldTypeUtils.isBarcodeType(
        field.type)) {
      line += ',,';
    } else {
      line += ',';
    }
  }

  return line;
}

/**
 * generateCSVFieldValues - description
 *
 * @param  {type} baseField   description
 * @param  {type} ff          description
 * @param  {type} downloadUrl description
 * @param  {type} sub         description
 * @return {type}             description
 */
function generateCSVFieldValues(baseField, ff, downloadUrl, sub) {
  var line = '';
  var fieldValues = [];

  if (ff) {
    fieldValues = misc.filterOutNullData(ff.fieldValues);
  }

  if (baseField && baseField.repeating) {
    for (var j = 0; j < baseField.fieldOptions.definition.maxRepeat; j++) {
      line += generateCSVSingleValue(baseField, fieldValues[j], downloadUrl, sub._id);
    }
  } else {
    line += generateCSVSingleValue(baseField, fieldValues[0], downloadUrl, sub._id);
  }

  return line;
}

module.exports = {
  generateCSVFieldValues: generateCSVFieldValues,
  generateCSVSingleValue: generateCSVSingleValue
};
