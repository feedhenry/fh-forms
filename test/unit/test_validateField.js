var async = require('async');
var util = require('util');
var assert = require('assert');

var formsRulesEngine = require('../../lib/common/forms-rule-engine.js');

var exampleFields = require('../Fixtures/formSubmissions.js');

var testSubmitFormBaseInfo = {
  "appId": "appId123456",
  "appCloudName": "appCloudName123456",
  "appEnvironment": "devLive",
  "userId": "user123456",
  "deviceId": "device123456",
  "deviceIPAddress": "192.168.1.1",
  "deviceFormTimestamp": new Date(Date.now()).toUTCString(),
  "comments": [{
    "madeBy": "somePerson@example.com",
    "madeOn": new Date(Date.now()).toUTCString(),
    "value": "This is a comment"
  },{
    "madeBy": "somePerson@example.com",
    "madeOn": new Date(Date.now()).toUTCString(),
    "value": "This is another comment"
  }]
};

function fieldValidator(fieldDef, submission) {
  var retVal;
  var engine = formsRulesEngine({"submission" : null, "definition" : null});
  engine.validateFieldInternal(submission, fieldDef, {}, true, function (err, results) {
    if(err) {
      retVal = err;
    } else {
      if (results.fieldErrorMessage && results.fieldErrorMessage.length > 0) {
        retVal = new Error(results.fieldErrorMessage[0]);
      } else {
        for(var i=0; i < results.errorMessages.length; i += 1) {
          if(results.errorMessages[i]) {
            retVal = new Error(results.errorMessages[i]);
            break;
          }
        }
      }
    }
  });

  return {
    validate: function(cb) {
      return cb(retVal);
    }
  };
}

exports.testValidateTooFewSubmissions = function(finish){

  var testField = {
    "name":"textField",
    "helpText":"This is a text field",
    "type":"text",
    "adminOnly": false,
    "repeating":true,
    "required":true,
    "fieldOptions":{
      "definition":{
        "maxRepeat":5,
        "minRepeat":2
      },
      "validation":{
        "min":5,
        "max":20
      }
    }
  };
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateTooManySubmissions = function(finish){

  var testField = exampleFields.textFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "test2", "test3", "test4", "test5", "test6"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));
    finish();
  });
}




exports.testValidateTextField = function(finish){
  var testField = exampleFields.textFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "test2", "test3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateTextFieldNotText = function(finish){
  var testField = exampleFields.textFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", 2, {"something" : "else"}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateTextFieldTooShort = function(finish){
  var testField = exampleFields.textFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "sd", "as"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateTextFieldTooLong = function(finish){
  var testField = exampleFields.textFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "ttttttoooooonnnnnggggg", "test1"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}


// FIELD_FORMAT_MODE : 'fieldOptions.definition.field_format_mode',
// FIELD_FORMAT_STRING : 'fieldOptions.definition.field_format_string',
// field_format_string is the "ccnnnn" or regex string
// 14:26
// field_format_mode is either
// "simple" or "regex"
exports.testValidateTextFieldWithFormatRegex = function(finish){
  var testField = {
    "name":"textField",
    "helpText":"This is a text field",
    "type":"text",
    "adminOnly": false,
    "repeating":true,
    "required":true,
    "fieldOptions":{
      "definition":{
        "maxRepeat":5,
        "minRepeat":1
      },
      "validation":{
        "min":0,
        "max":20,
        "field_format_mode":"regex",
        "field_format_string": "^[a-zA-Z0-9][a-zA-Z0-9][0-9][0-9][0-9]\\u002D[0-9][0-9][0-9][0-9]$"
      }
    }
  };
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [
    {fieldValues: ["EN201-4123"], result: true},
    {fieldValues: ["is349-2328"], result: true},
    {fieldValues: ["aB000-2320"], result: true},
    {fieldValues: ["aB000-2320"], result: true},
    {fieldValues: ["EN201-2324", "is349-2328"], result: true},
    {fieldValues: ["is349-3248", "is349-2328"], result: true},
    {fieldValues: ["aB000-0000", "EN201-4324"], result: true},
    {fieldValues: ["aB00-2320"], result: false},
    {fieldValues: ["aB000-220"], result: false},
    {fieldValues: ["aB00--2320"], result: false},
    {fieldValues: ["aB000--2320"], result: false},
    {fieldValues: ["aB000a2320"], result: false},
    {fieldValues: ["aB000/2320"], result: false},
    {fieldValues: ["EN20141"], result: false},
    {fieldValues: ["EN20-3441", "is3498"], result: false},
    {fieldValues: ["i349-0008"], result: false},
    {fieldValues: ["3aB00-2300"], result: false},
    {fieldValues: ["is349-0008", "3aB0000"], result: false},
    {fieldValues: [" is3498"], result: false},
    {fieldValues: ["is3498 "], result: false},
    {fieldValues: ["aB000"], result: false},
    {fieldValues: ["AB"], result: false},
    {fieldValues: ["0000"], result: false},
    {fieldValues: [""], result: false},
    {fieldValues: ["aBc000"], result: false},
    {fieldValues: ["AB 498"], result: false},
    {fieldValues: ["aB 0000"], result: false}
  ];

  assert.equal(testField.fieldOptions.validation.field_format_mode, "regex", 'bad test data, expected field format simple');
  async.each(testSubmissionData, function (testValues, cb) {
    testSubmission.fieldValues = testValues.fieldValues;
    var validator = fieldValidator(testField, testSubmission);
    validator.validate(function(err){
      assert.equal(!err, testValues.result, 'Unexpected ' + (testValues.result?"failure":"success") + ': ' + util.inspect(err) + ', when testing: ' + util.inspect(testValues));
      return cb();
    });
  }, function (err) {
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));
    finish();
  });
}

exports.testValidateTextFieldWithFormatSimple = function(finish){
  var testField = {
    "name":"textField",
    "helpText":"This is a text field",
    "type":"text",
    "adminOnly": false,
    "repeating":true,
    "required":true,
    "fieldOptions":{
      "definition":{
        "maxRepeat":5,
        "minRepeat":1
      },
      "validation":{
        "min":0,
        "max":20,
        "field_format_mode":"simple",
        "field_format_string": "ccnnn-nnnn"
      }
    }
  };
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [
    {fieldValues: ["EN201-4123"], result: true},
    {fieldValues: ["is349-2328"], result: true},
    {fieldValues: ["aB000-2320"], result: true},
    {fieldValues: ["aB000-2320"], result: true},
    {fieldValues: ["EN201-2324", "is349-2328"], result: true},
    {fieldValues: ["is349-3248", "is349-2328"], result: true},
    {fieldValues: ["aB000-0000", "EN201-4324"], result: true},
    {fieldValues: ["aB00-2320"], result: false},
    {fieldValues: ["aB000-220"], result: false},
    {fieldValues: ["aB00--2320"], result: false},
    {fieldValues: ["aB000--2320"], result: false},
    {fieldValues: ["aB000a2320"], result: false},
    {fieldValues: ["aB000/2320"], result: false},
    {fieldValues: ["EN20141"], result: false},
    {fieldValues: ["EN20-3441", "is3498"], result: false},
    {fieldValues: ["i349-0008"], result: false},
    {fieldValues: ["3aB00-2300"], result: false},
    {fieldValues: ["is349-0008", "3aB0000"], result: false},
    {fieldValues: [" is3498"], result: false},
    {fieldValues: ["is3498 "], result: false},
    {fieldValues: ["aB000"], result: false},
    {fieldValues: ["AB"], result: false},
    {fieldValues: ["0000"], result: false},
    {fieldValues: [""], result: false},
    {fieldValues: ["aBc000"], result: false},
    {fieldValues: ["AB 498"], result: false},
    {fieldValues: ["aB 0000"], result: false}
  ];

  assert.equal(testField.fieldOptions.validation.field_format_mode, "simple", 'bad test data, expected field format simple');
  async.eachSeries(testSubmissionData, function (testValues, cb) {
    testSubmission.fieldValues = testValues.fieldValues;
    var validator = fieldValidator(testField, testSubmission);
    validator.validate(function(err){
      assert.equal(!err, testValues.result, 'Unexpected ' + (testValues.result?"failure":"success") + ': ' + util.inspect(err) + ', when testing: ' + util.inspect(testValues));
      return cb();
    });
  }, function (err) {
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));
    finish();
  });
}

exports.testValidateTextArea = function(finish){
  var testField = exampleFields.textAreaFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "test2", "test3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateTextAreaNotText = function(finish){
  var testField = exampleFields.textAreaFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", 2, {}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateTextAreaTooShort = function(finish){
  var testField = exampleFields.textAreaFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "sd", "as"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateTextAreaTooLong = function(finish){
  var testField = exampleFields.textAreaFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test1", "ttttttoooooonnnnnggggg", "test1"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}






exports.testValidateNumber = function(finish){
  var testField = exampleFields.numberFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [11, 22, 56];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateNumberNotNumber = function(finish){
  var testField = exampleFields.numberFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [11, "NotANumber", 56];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateNumberTooBig = function(finish){
  var testField = exampleFields.numberFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [1112, 22, 56];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateNumberTooSmall = function(finish){
  var testField = exampleFields.numberFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [11, 22, 4];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}





exports.testValidateEmailAddress = function(finish){
  var testField = exampleFields.emailAddressFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test@example.com", "test2@example.com", "test3@feedhenry.com"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateEmailAddressNotString = function(finish){
  var testField = exampleFields.emailAddressFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test@example.com", {"email" : "test2@example.com"}, "test3@feedhenry.com"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateEmailAddressInvalidEmail = function(finish){
  var testField = exampleFields.emailAddressFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["test@example.com", "test2example.com", "test3@feedhenry.com"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateUrl = function(finish){
  var testField = exampleFields.urlFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["dropdownVal1", "dropdownVal2", "dropdownVal3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateDropdown = function(finish){
  var testField = exampleFields.dropdownFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["dropdownVal1", "dropdownVal2", "dropdownVal3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateDropdownNotAString = function(finish){
  var testField = exampleFields.dropdownFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["dropdownVal1", {"dropVal" : "dropdownVal2"}, "dropdownVal3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateDropdownDoesNotExist = function(finish){
  var testField = exampleFields.dropdownFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["dropdownVal1", "dropdownVal22", "dropdownVal3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

// test for bug #5815
exports.testValidateDropdownDuplicateOptions = function(finish){
  var testField = JSON.parse(JSON.stringify(exampleFields.dropdownFieldData));
  assert.ok(testField.fieldOptions.definition.options.length >= 2, 'strange test data');
  testField.fieldOptions.definition.options[0] = testField.fieldOptions.definition.options[1]; // option is now duplicated

  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["dropdownVal2", "dropdownVal2", "dropdownVal3"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateRadio = function(finish){
  var testField = exampleFields.radioFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["radio1", "radio2"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateRadioDuplicateOptions = function(finish){
  var testField = JSON.parse(JSON.stringify(exampleFields.radioFieldData));
  assert.ok(testField.fieldOptions.definition.options.length >= 2, 'strange test data');
  testField.fieldOptions.definition.options[0] = testField.fieldOptions.definition.options[1]; // option is now duplicated

  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["radio2", "radio2"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateRadioDoesNotExist = function(finish){
  var testField = exampleFields.radioFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["radio1", "radio22"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}





exports.testValidateCheckbox = function(finish){
  var testField = exampleFields.checkboxFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"selections" : ["red", "blue", "green"]}, {"selections" : ["red", "blue", "purple"]}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateCheckboxDoesNotExist = function(finish){
  var testField = exampleFields.checkboxFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"selections" : ["red", "wrongOption", "green"]}, {"selections" : ["red", "blue", "purple"]}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateCheckboxDoesTooMany = function(finish){
  var testField = exampleFields.checkboxFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"selections" : ["red", "blue", "green", "purple"]}, {"selections" : ["red", "blue", "purple"]}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateCheckboxDoesTooFew = function(finish){
  var testField = exampleFields.checkboxFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"selections" : ["red", "blue"]}, {"selections" : ["red"]}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}




exports.testValidateLocationLatLong = function(finish){
  var testField = exampleFields.locationLatLongFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"lat" : "5.555848", "long" : "-52.031250"}, {"lat" : "1.552348", "long" : "-13.031430"}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateLocationLatLongWrongIndices = function(finish){
  var testField = exampleFields.locationLatLongFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"key" : "5.555848", "val" : "-52.031250"}, {"key" : "1.552348", "val" : "-13.031430"}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateLocationLatLongWrongValues = function(finish){
  var testField = exampleFields.locationLatLongFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"lat" : "5.555848", "long" : "-52.031250"}, {"lat" : "fas48", "long" : "-13.031430"}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}




exports.testValidateLocationNorthEast = function(finish){
  var testField = exampleFields.locationNorthEastFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"zone" : "TG", "eastings" : "59434", "northings" : "56374"}, {"zone" : "TU", "eastings" : 594934, "northings" : 5636174}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);



  validator.validate(function(err){
    if(err) console.log(err);
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateLocationNorthEastWrongValues = function(finish){
  var testField = exampleFields.locationNorthEastFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"zone" : "1U", "eastings" : "BAD", "northings" : "5636174"}, {"zone" : "12U", "eastings" : "594934", "northings" : "5636174"}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateLocationNorthEastWrongKeys = function(finish){
  var testField = exampleFields.locationNorthEastFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{"zones" : "11U", "eastings" : "594934", "northings" : "5636174"}, {"zones" : "12U", "eastings" : "594934", "northings" : "5636174"}];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}




exports.testValidatePhoto = function(finish){
  var testField = exampleFields.photoFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{
    "fileName":"MyLovelyHorse.jpg",
    "fileSize":100000,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder1234567"
  },
  {
    "fileName":"MyOtherHorse.jpg",
    "fileSize":100000,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder12345678"
  }];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}


exports.testValidatePhotoWrongPlaceholder = function(finish){
  var testField = exampleFields.photoFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{
    "fileName":"MyLovelyHorse.jpg",
    "fileSize":100000,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlHolder1234567"
  },
  {
    "fileName":"MyOtherHorse.jpg",
    "fileSize":100000,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder12345678"
  }];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}



exports.testValidateFile = function(finish){
  var testField = exampleFields.fileFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{
    "fileName":"MyLovelyHorse.jpg",
    "fileSize":100000,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder1234567"
  },
  {
    "fileName":"MyOtherHorse.jpg",
    "fileSize":100000,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder12345678"
  }];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);



  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateFileNoValue = function(finish){
  var testField = exampleFields.fileFieldDataOne;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);



  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateFileObjects = function(finish){
  var testField = exampleFields.fileFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [
   { num: 00, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: true },
   { num: 01, value: { "fileName":12334,               "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 02, value: { "fileName":undefined,           "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 03, value: {                                 "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 04, value: { "fileName":"",                  "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 05, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000,   "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: true },
   { num: 06, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":"1234567", "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 07, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":{},        "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 08, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":undefined, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 09, value: { "fileName":"MyLovelyHorse.jpg",                       "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 10, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: true },
   { num: 11, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":23,           "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 12, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":undefined,    "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 13, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":{},           "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 14, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000,                          "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 15, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(),   "hashName":"filePlaceHolder1234567" }, valid: true },
   { num: 16, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":"2013/12/12", "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 17, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":{},           "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 18, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":undefined,    "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 19, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg",                                "hashName":"filePlaceHolder1234567" }, valid: false },
   { num: 20, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: true },
   { num: 21, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":""                       }, valid: false },
   { num: 22, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":12345667                 }, valid: false },
   { num: 23, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePaceHolder1234567"  }, valid: false },
   { num: 24, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":undefined                }, valid: false },
   { num: 25, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000000, "fileType":"image/jpeg", "fileUpdateTime":Date.now()                                     }, valid: false },
   { num: 26, value: { "fileName":"MyLovelyHorse.jpg", "fileSize":1000001, "fileType":"image/jpeg", "fileUpdateTime":Date.now(), "hashName":"filePlaceHolder1234567" }, valid: false }
  ];

  async.each(testSubmissionData, function (testSubmissionDatum, cb) {
    testSubmission.fieldValues = [testSubmissionDatum.value, testSubmissionDatum.value];
    var validator = fieldValidator(testField, testSubmission);
    validator.validate(function(err){
      if(testSubmissionDatum.valid) {
        assert.ok(!err, 'Unexpected error: ' + util.inspect(err) + "for testdata " + testSubmissionDatum.num);
      } else {
        assert.ok(err, 'Expected error: ' + util.inspect(err));
      }
      return cb();
    });
  }, function (err) {
    assert.ok(!err);
    finish();
  });

}

exports.testValidateFileWrongPlaceholder = function(finish){
  var testField = exampleFields.fileFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{
    "fileName":"MyLovelyHorse.jpg",
    "fileSize":1234567,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlHolder1234567"
  },
  {
    "fileName":"MyOtherHorse.jpg",
    "fileSize":1238887,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder12345678"
  }];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateSignature = function(finish){
  var testField = exampleFields.signatureFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{
    "fileName":"MySignature1.jpg",
    "fileSize":1234567,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder1234567"
  },
  {
    "fileName":"MySignature1.jpg",
    "fileSize":1238887,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder12345678"
  }];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);



  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateSignatureWrongPlaceholder = function(finish){
  var testField = exampleFields.signatureFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = [{
    "fileName":"MySignature1.jpg",
    "fileSize":1234567,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlHolder1234567"
  },
  {
    "fileName":"MySignature2.jpg",
    "fileSize":1238887,
    "fileType":"image/jpeg",
    "fileUpdateTime":Date.now(),
    "hashName":"filePlaceHolder12345678"
  }];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}


exports.testValidateSectionBreak = function(finish){
  var testField = exampleFields.sectionBreakFieldData;
  var testSubmission = testSubmitFormBaseInfo;
  var testSubmissionData = ["sectionBreakSubmission", "sectionBreakSubmission2"];

  testSubmission.fieldValues = testSubmissionData;

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}


/**
 * Testing barcode data entry.
 * @param finish
 */
exports.testValidateBarcode = function(finish){
  var testField = exampleFields.barcodeFieldData;

  var testSubmission = testSubmitFormBaseInfo;

  testSubmission.fieldValues = [{
    text: "barcode-data",
    format: "QR_CODE"
  }];

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(!err, 'Unexpected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateBarcodeNoText = function(finish){
  var testField = exampleFields.barcodeFieldData;

  var testSubmission = testSubmitFormBaseInfo;

  testSubmission.fieldValues = [{
    format: "QR_CODE"
  }];

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}

exports.testValidateBarcodeNoFormat = function(finish){
  var testField = exampleFields.barcodeFieldData;

  var testSubmission = testSubmitFormBaseInfo;

  testSubmission.fieldValues = [{
    text: "barcode-data"
  }];

  var validator = fieldValidator(testField, testSubmission);

  validator.validate(function(err){
    assert.ok(err, 'Expected error, but was: ' + util.inspect(err));

    finish();
  });
}