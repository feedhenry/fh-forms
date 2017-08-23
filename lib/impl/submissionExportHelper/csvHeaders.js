var csvStr = require('./csvStringFromValue');
var _ = require('underscore');
var fieldTypeUtils = require('./fieldTypeUtils');
var endsWith = require('./endsWith');
var sectionUtils = require('../../utils/sectionsUtils');

var metaDataHeaders = ['formName', 'formId', '_id',
  'submissionCompletedTimestamp', 'appCloudName', 'deviceId',
  'deviceIPAddress', 'updatedTimestamp'
];

/**
 * generateFieldHeader - Generating A single field header.
 *
 * @param  {object} field            Field definition
 * @param  {string} headerName       Header Name to add
 * @param  {number} fieldRepeatIndex The index of a repeating field (null if it is not repeating)
 * @return {string}                  Generated CSV
 */
function generateFieldHeader(field, headerName, fieldRepeatIndex) {
  var csv = '';
  //If the field is repeating, the structure of the header is different
  if (_.isNumber(fieldRepeatIndex)) {
    //If it is a file type field, need to add two fields for the file name and url
    if (fieldTypeUtils.isFileType(field.type)) {
      csv += csvStr(headerName + '-' + (fieldRepeatIndex + 1) + "-name") + ",";
      csv += csvStr(headerName + '-' + (fieldRepeatIndex + 1) + "-url");
    } else if (fieldTypeUtils.isBarcodeType(field.type)) {
      //If it is a barcode type field, need to add two fields for the format name and text
      csv += csvStr(headerName + '-' + (fieldRepeatIndex + 1) + "-format") +
        ",";
      csv += csvStr(headerName + '-' + (fieldRepeatIndex + 1) + "-text");
    } else {
      //Otherwise, just append the index.
      csv += csvStr(headerName + '-' + (fieldRepeatIndex + 1));
    }
  } else {
    //If it is a file type field, need to add two fields for the file name and url
    if (fieldTypeUtils.isFileType(field.type)) {
      csv += csvStr(headerName + "-name") + ",";
      csv += csvStr(headerName + "-url");
    } else if (fieldTypeUtils.isBarcodeType(field.type)) {
      //If it is a barcode type field, need to add two fields for the format name and text
      csv += csvStr(headerName + "-format") + ",";
      csv += csvStr(headerName + "-text");
    } else {
      csv += csvStr(headerName);
    }
  }

  return csv;
}

/**
 * generateCSVHeader - Generating the Headers For All Of The Fields In The CSV
 *
 * @param  {string} csv              Existing CSV String.
 * @param  {object} field            Field definition
 * @param  {string} headerName       Header Name to add
 * @param  {number} fieldRepeatIndex The index of a repeating field (null if it is not repeating)
 * @return {string}                  Generated CSV
 */
function generateCSVHeader(csv, field, headerName, fieldRepeatIndex) {

  //If the previous csv value is set, then a ',' is needed to separate.
  if (csv) {
    csv += ',';
  }

  // Sanity check after the headers to ensure we don't have a double ,, appearing
  // The above if is necessary and cannot be removed
  if (endsWith(csv, ',,')) {
    csv = csv.slice(0, -1);
  }

  csv += generateFieldHeader(field, headerName, fieldRepeatIndex);

  return csv;
}

/*
 * Here we need to parse for escaped characters, Timestamps are the exception to this because of their format and we need to handle undefined elements
 */
function addMetadataValues(line, sub) {
  _.each(metaDataHeaders, function(headerName) {
    if (headerName === 'submissionCompletedTimestamp' || headerName ===
      'updatedTimestamp' || sub[headerName] === undefined) {
      line += sub[headerName] + ',';
    } else {
      var parsedLine = csvStr(sub[headerName]);
      line += parsedLine + ',';
    }

  });
  return line;
}

/**
 * generateCSVHeaders - Generating CSV Headers from a merged form definition
 *
 * @param  {array} fieldKeys          Field IDs
 * @param  {object} mergedFieldEntries Merged field definitions
 * @param  {string} fieldHeader        Header type to use (fieldName, fieldCode)
 * @return {string}
 */
function generateCSVHeaders(fieldKeys, mergedFieldEntries, fieldHeader) {
  var csv = '';
  var fieldRepeatIndex = 0;
  // Here we need to add the metaDataHeaders
  _.each(metaDataHeaders, function(headerName) {
    csv += headerName + ',';
  });

  var fieldKeysProcessed = [];

  fieldKeys.forEach(function(fieldKey) {
  // check if its a repeating form (and extra headers required)
    var field = mergedFieldEntries[fieldKey];
    if (field.type === 'sectionBreak' && field.repeating) {
      var fieldsInThisSection = sectionUtils.getFieldsInSection(field._id, _.values(mergedFieldEntries));
      for (var i = 0; i < field.fieldOptions.definition.maxRepeat; i++) {
        _.each(fieldsInThisSection, function(fieldInThisSection) {
          fieldKeysProcessed.push({key: fieldInThisSection._id, sectionIndex: i + 1, inRepeatingForm: true});
        });
      }
    } else {
      fieldKeysProcessed.push({key: fieldKey});
    }
  });

  //for each form get each of the unique fields and add a header
  fieldKeysProcessed.forEach(function(processedField) {
    // check if its a repeating form (and extra headers required)
    var field = mergedFieldEntries[processedField.key];

    //Fields may not have a field code, if not just use the field name.
    var headerName = typeof (field[fieldHeader]) === "string" ? field[fieldHeader] : field.name;

    if (processedField.inRepeatingForm) {
      headerName = '(section repeat: ' + processedField.sectionIndex + ') ' + headerName;
    }
    if (field.repeating === true) {
      for (fieldRepeatIndex = 0; fieldRepeatIndex < field.fieldOptions.definition.maxRepeat; fieldRepeatIndex++) {
        csv = generateCSVHeader(csv, field, headerName, fieldRepeatIndex);
      }
    } else {
      csv = generateCSVHeader(csv, field, headerName, null);
    }
  });

  csv += '\r\n';
  return csv;
}

module.exports = {
  generateCSVHeaders: generateCSVHeaders,
  addMetadataValues: addMetadataValues
};
