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
  "fieldRules":[
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 3"
      }],
      "targetField": TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID,
      "_id":"527d4539639f521e0a054321"
    },
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 5"
      }],
      "targetField": TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID,
      "_id":"527d4539639f521e0a001234"
    }
  ],
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
          "repeating":false
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

var TEST_BASIC_FORM_1_SUBMISSION_HIDE_FIELD3 = {
   "appId":"appId123456",
   "appCloudName":"appCloudName123456",
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
            "hide 3"
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

var TEST_BASIC_FORM_1_SUBMISSION_NO_FIELD1 = {
   "appId":"appId123456",
   "appCloudName":"appCloudName123456",
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

module.exports.testBasicFormCheckRulesIncompleteSubmission = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);

  var tests = [
    {
      name: "one",
      submission: TEST_BASIC_FORM_1_SUBMISSION_NO_FIELD1,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
      ]
    },
    {
      name: "two",
      submission: TEST_BASIC_FORM_1_SUBMISSION_HIDE_FIELD3,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: false},
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
      ]
    },
    {
      name: "three",
      submission: TEST_BASIC_FORM_1_SUBMISSION_NO_FIELD1,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
      ]
    }
  ];

  async.eachSeries(tests,   // these tests are using the same "engine" object, can't run in parallel
    function (oneTest, cb) {
      engine.checkRules(oneTest.submission, function (err, results) {
        assert.ok(!err);
        assert.ok(results);
        assert.ok(results.actions);
        assert.ok(results.actions.fields);
        assert.equal(Object.keys(results.actions.fields).length, 2, 'Should only be 2 fields listed, since only 2 targets specified in rules' + util.inspect(results.actions.fields));
        assert.ok(results.actions.pages);
        assert.equal(Object.keys(results.actions.pages).length, 0, 'Should be 0 pages listed, since no page targets specified in rules');

        async.each(oneTest.fieldsToCheck, function (fieldTest, cb) {
          assert.ok(results.actions.fields[fieldTest.fieldID + '_0'], 'expected field ' + fieldTest.fieldID + ' not listed in results: ' + util.inspect(results.actions.fields));
          assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].targetId, fieldTest.fieldID);
          assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].action, fieldTest.expectedVisible?"show":"hide", 'expected action ' + (fieldTest.expectedVisible?"show":"hide") + ', for field: ' + fieldTest.fieldID);
          return cb();
        }, function (err) {
          assert.ok(!err);
          return cb();
        });
      });
    }, function (err) {
      assert.ok(!err);
      finish();
  });
};
