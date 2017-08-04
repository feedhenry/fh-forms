var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var CONSTANTS = require('../constants');
var fieldFunctions = require('./fieldFunctions');
var FORM_CONSTANTS = CONSTANTS.FORM_CONSTANTS;

module.exports = function() {
  var fieldSchema = new Schema({
    "name": {type: String, required: true},
    "helpText": String,
    "dataSource": { type: Schema.Types.ObjectId, ref: CONSTANTS.MODELNAMES.DATA_SOURCE, required: false },
    "dataSourceType": {type: String, enum: [FORM_CONSTANTS.DATA_SOURCE_TYPE_STATIC, FORM_CONSTANTS.DATA_SOURCE_TYPE_DATA_SOURCE], default: FORM_CONSTANTS.DATA_SOURCE_TYPE_STATIC},
    //Unique field code defined by the user.
    "fieldCode": {type: String, required: false},
    "type": {type: String, required: true, enum: [FORM_CONSTANTS.FIELD_TYPE_TEXT, FORM_CONSTANTS.FIELD_TYPE_TEXT_AREA, FORM_CONSTANTS.FIELD_TYPE_URL, FORM_CONSTANTS.FIELD_TYPE_NUMBER, FORM_CONSTANTS.FIELD_TYPE_EMAIL, FORM_CONSTANTS.FIELD_TYPE_CHECKBOXES, FORM_CONSTANTS.FIELD_TYPE_RADIO, FORM_CONSTANTS.FIELD_TYPE_DROPDOWN, FORM_CONSTANTS.FIELD_TYPE_LOCATION, FORM_CONSTANTS.FIELD_TYPE_MAP, FORM_CONSTANTS.FIELD_TYPE_PHOTO, FORM_CONSTANTS.FIELD_TYPE_SIGNATURE, FORM_CONSTANTS.FIELD_TYPE_FILE, FORM_CONSTANTS.FIELD_TYPE_DATE_TIME, FORM_CONSTANTS.FIELD_TYPE_SECTION_BREAK, FORM_CONSTANTS.FIELD_TYPE_MATRIX, FORM_CONSTANTS.FIELD_TYPE_BARCODE, FORM_CONSTANTS.FIELD_TYPE_SLIDER_NUMBER, FORM_CONSTANTS.FIELD_TYPE_READ_ONLY]},
    //All fields can be repeating.
    "repeating": {type: Boolean, default: false},
    "fieldOptions": {type: Schema.Types.Mixed, default: {}, required: true},
    "required": {type: Boolean, required: true},
    "adminOnly": {type: Boolean, default: false},
    "sectionIndex": {type: Number}
  }, CONSTANTS.SCHEMA_OPTIONS);

  // If it is a static data source type, then don't save the data source id
  // This is to ensure that data sources that are not used in a form are not associated with it.
  fieldSchema.pre('save', function(next) {
    if (this.dataSourceType === FORM_CONSTANTS.DATA_SOURCE_TYPE_STATIC) {
      this.dataSource = undefined;
    }

    next();
  });

  //If the field is a dateTime field using the datetime unit, then ensure it has a dateTimeFormat option set.
  fieldSchema.pre('save', fieldFunctions.dateTimeField.ensureDateTimeFormat);

  fieldSchema.path('dataSourceType').validate(function(dataSourceType) {
    //If the field type is set to be a dataSource, then a data source id should have been provided.
    if (dataSourceType === FORM_CONSTANTS.DATA_SOURCE_TYPE_DATA_SOURCE) {
      return this.dataSource !== undefined;
    }

    return true;
  }, "Invalid Data Source Option");

  //Validating That Data Sources Are Not Applied To Incorrect Fields
  fieldSchema.path('dataSourceType').validate(function(dataSourceType) {
    if (dataSourceType === FORM_CONSTANTS.DATA_SOURCE_TYPE_DATA_SOURCE) {
      return isValidDataSourceFieldType(this.type);
    }

    return true;
  }, "Data Sources Can Only Be Applied To Radio, Checkbox, Dropdown And Read-Only Fields");

  function isValidDataSourceFieldType(type) {
    return type === FORM_CONSTANTS.FIELD_TYPE_CHECKBOXES || type === FORM_CONSTANTS.FIELD_TYPE_RADIO || type === FORM_CONSTANTS.FIELD_TYPE_DROPDOWN || type === FORM_CONSTANTS.FIELD_TYPE_READ_ONLY;
  }

  fieldSchema.path('fieldOptions').validate(function(fieldOptions) {
    //If the data source type is static, then there should be field options specified
    if (this.dataSourceType === FORM_CONSTANTS.DATA_SOURCE_TYPE_STATIC && isValidDataSourceFieldType(this.type)) {
      var definition = fieldOptions.definition || {};
      var options = definition.options || [];
      return options.length > 0;
    }

    //If it is data source, then no options are required.
    return true;
  }, "A Static Radio, Checkboxes or Dropdown Field Type Must Contain Field Options");


  return fieldSchema;
};
