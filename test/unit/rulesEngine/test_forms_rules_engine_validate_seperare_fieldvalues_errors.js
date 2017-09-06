var async = require('async');
var util = require('util');
var assert = require('assert');

var formsRulesEngine = require('../../../lib/common/forms-rule-engine.js');

var TEST_BASIC_FORM_1_PAGE_1_NAME = "TEST_BASIC_FORM_1_PAGE_1_NAME";
var TEST_BASIC_FORM_1_PAGE_1_ID = "000000000000000000000001";

var TEST_BASIC_FORM_1_PAGE_1_FIELD_1_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_1_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_1_TYPE = "text";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID = "000000000000000000000002";

var TEST_BASIC_FORM_1_PAGE_1_FIELD_2_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_2_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_2_TYPE = "textarea";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID = "000000000000000000000003";

var TEST_BASIC_FORM_1_PAGE_1_FIELD_3_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_3_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_3_TYPE = "number";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID = "000000000000000000000004";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE = 100;

var TEST_BASIC_FORM_1_PAGE_1_FIELD_4_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_4_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_4_TYPE = "sectionBreak";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID = "000000000000000000000005";

var TEST_BASIC_FORM_1_PAGE_1_FIELD_5_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_5_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_5_TYPE = "emailAddress";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID = "000000000000000000000006";



var TEST_BASIC_FORM_1_DEFINITION = {
 "updatedBy":"user@example.com",
  "createdBy":"user@example.com",
  "name":"TEST_BASIC_FORM_1_DEFINITION",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing rules.",
  "_id":"527d4539639f521e0a000004",
  "pageRules":[],
  "fieldRules":[],
  "pages":[
    {
      "name":TEST_BASIC_FORM_1_PAGE_1_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_FORM_1_PAGE_1_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_NAME,
          "helpText":"This is a text field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":20,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_NAME,
          "helpText":"This is a text area field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":3
            },
            "validation":{
              "min":50,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_NAME,
          "helpText":"This is a number field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max": TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE
            }
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID,
          "repeating":true
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_4_NAME,
          "helpText":"This is a sectionBreak field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_4_TYPE, //"sectionBreak",
          "required":false,
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_NAME,
          "helpText":"This is a Email field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_TYPE, //"emailAddress",
          "required":true,
          "fieldOptions":{
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID,
          "repeating":false
        }
      ]
    }
  ],
  "pageRef":{
    TEST_BASIC_FORM_1_PAGE_1_ID:0
  },
  "fieldRef": {
    TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID: {
      "page":0,
      "field":0
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID: {
      "page":0,
      "field":1
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID: {
      "page":0,
      "field":2
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID: {
      "page":0,
      "field":3
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID: {
      "page":0,
      "field":4
    }
  },
  "appsUsing":123,
  "submissionsToday":1234,
  "submissionsTotal":124125
};

var TEST_BASIC_FORM_2_DEFINITION = {
 "updatedBy":"user@example.com",
  "createdBy":"user@example.com",
  "name":"TEST_BASIC_FORM_1_DEFINITION",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing rules.",
  "_id":"527d4539639f521e0a000004",
  "pageRules":[],
  "fieldRules":[],
  "pages":[
    {
      "name":TEST_BASIC_FORM_1_PAGE_1_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_FORM_1_PAGE_1_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_NAME,
          "helpText":"This is a text field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":20,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_NAME,
          "helpText":"This is a text area field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":3
            },
            "validation":{
              "min":50,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_NAME,
          "helpText":"This is a number field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max": TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE
            }
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID,
          "repeating":true
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_4_NAME,
          "helpText":"This is a sectionBreak field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_4_TYPE, //"sectionBreak",
          "required":false,
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_NAME,
          "helpText":"This is a Email field",
          "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_TYPE, //"emailAddress",
          "required":true,
          "fieldOptions":{
          },
          "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID,
          "repeating":false
        }
      ]
    }
  ],
  "pageRef":{
    TEST_BASIC_FORM_1_PAGE_1_ID:0
  },
  "fieldRef": {
    TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID: {
      "page":0,
      "field":0
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID: {
      "page":0,
      "field":1
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID: {
      "page":0,
      "field":2
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID: {
      "page":0,
      "field":3
    },
    TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID: {
      "page":0,
      "field":4
    }
  },
  "appsUsing":123,
  "submissionsToday":1234,
  "submissionsTotal":124125
};

var TEST_BASIC_FORM_1_SUBMISSION_1 = {
   "appId":"appId123456",
   "appCloudName":"appCloudName123456",
  "timezoneOffset" : 120,
   "appEnvironment":"devLive",
   "deviceId":"device123456",
   "deviceFormTimestamp":1384800150848,
   "comments":[
      {
         "madeBy":"somePerson@example.com",
         "madeOn":1384800150848,
         "value":"This is a comment"
      },
      {
         "madeBy":"somePerson@example.com",
         "madeOn":1384800150848,
         "value":"This is another comment"
      }
   ],
   "formFields":[
      {
         "fieldId":TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID,
         "fieldValues":[
            //234567890123456789012345678901234567890123456789012345678901
            "value for text field (2)56789012345678901234567890"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID,
         "fieldValues":[
            TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID,
         "fieldValues":[
            "testing@example.com"
         ]
      }
   ]
};






// "validation": {
//         "valid":false,
//         "fieldId": {
//             "fieldId": "",
//             "valid": true/false,
//             "errorMessages": [
//                 null,
//                 "should not contain dammit"
//             ],
//             "fieldErrorMessage":[
//                 "this field is required",
//                 "this field should repeat at least twice"
//             ]
//         },
//         "fieldId1": {

//         }
//     }
// }

module.exports.testBasicForm1ValidateFormInvalid = function (finish) {
  var TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE;

  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);

  async.series([
    function (cb) {
      engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD, function (err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
        assert.ok(!results.validation.valid, "Expected invalid result: " + util.inspect(results.validation));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3, which is in error');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked invalid');

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].fieldErrorMessage, 'Field 3 should have a field level error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].fieldErrorMessage.length > 0, 'Field 3 should have at least one field level error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].fieldErrorMessage[0].indexOf("min ") > -1, 'Field 3 should complain about min repeat' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].fieldErrorMessage));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have an value level error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length > 0, 'Field 3 should have 2 value level error message entries');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[0], 'Field 3 value 1 should be ok' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function (cb) {
      // change field to add invalid value
      TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues.push(TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE + 1);
      engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD, function (err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));

        assert.ok(!results.validation.valid, "Expected invalid result: " + util.inspect(results.validation));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3, which is in error');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked invalid');

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].fieldErrorMessage, 'Field 3 should have a field level error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].fieldErrorMessage.length === 0, 'Field 3 should have no field level error message');

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have  value level error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length === 2, 'Field 3 should have 2 value level error message entries');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[0], 'Field 3 value 1 should be ok' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[1].indexOf("max") > -1, 'Field 3 value 2 should complain about exceeding max value' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};
