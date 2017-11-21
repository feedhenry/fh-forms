var async = require('async');
var util = require('util');
var assert = require('assert');

var formsRulesEngine = require('../../../lib/common/forms-rule-engine.js');

var TEST_BASIC_FORM_2_PAGE_1_NAME = "TEST_BASIC_FORM_1_PAGE_1_NAME";
var TEST_BASIC_FORM_2_PAGE_1_ID = "000000000000000000000001";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_1_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_1_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_1_TYPE = "text";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID = "000000000000000000000002";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_2_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_2_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_2_TYPE = "textarea";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID = "000000000000000000000003";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_3_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_3_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_3_TYPE = "number";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID = "000000000000000000000004";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_4_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_4_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_4_TYPE = "sectionBreak";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID = "000000000000000000000005";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_5_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_5_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_5_TYPE = "emailAddress";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID = "000000000000000000000006";

var TEST_BASIC_FORM_2_PAGE_2_NAME = "TEST_BASIC_FORM_2_PAGE_2_NAME";
var TEST_BASIC_FORM_2_PAGE_2_ID = "000000000000000000020001";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_1_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_1_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_1_TYPE = "text";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID = "000000000000000000020002";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_2_TYPE = "textarea";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID = "000000000000000000020003";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_3_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_3_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_3_TYPE = "number";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID = "000000000000000000020004";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_4_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_4_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_4_TYPE = "sectionBreak";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID = "000000000000000000020005";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_5_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_5_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_5_TYPE = "emailAddress";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID = "000000000000000000020006";

var TEST_BASIC_FORM_2_PAGE_3_NAME = "TEST_BASIC_FORM_2_PAGE_3_NAME";
var TEST_BASIC_FORM_2_PAGE_3_ID = "000000000000000000020009";

var TEST_BASIC_FORM_2_PAGE_3_FIELD_6_NAME = "TEST_BASIC_FORM_2_PAGE_3_FIELD_6_NAME";
var TEST_BASIC_FORM_2_PAGE_3_FIELD_6_TYPE = "text";
var TEST_BASIC_FORM_2_PAGE_3_FIELD_6_ID = "000000000000000000020010";

var TEST_BASIC_FORM_2_PAGE_3_FIELD_7_NAME = "TEST_BASIC_FORM_2_PAGE_3_FIELD_7_NAME";
var TEST_BASIC_FORM_2_PAGE_3_FIELD_7_TYPE = "text";
var TEST_BASIC_FORM_2_PAGE_3_FIELD_7_ID = "000000000000000000020011";

var TEST_BASIC_FORM_2_DEFINITION = {
  "updatedBy":"user@example.com",
  "createdBy": "user@example.com",
  "name":"TEST_BASIC_FORM_2_DEFINITION",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing rules.",
  "_id":"527d4539639f521e0a000004",
  "pageRules":[
    {
      "type": "skip",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID,
        "restriction": "contains",
        "sourceValue": "hide page 2"
      }],
      "targetPage": TEST_BASIC_FORM_2_PAGE_2_ID,
      "_id":"527d4539639f521e0a007421"
    },
    {
      "type": "skip",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide page 2 and 3"
      }],
      "targetPage": [TEST_BASIC_FORM_2_PAGE_2_ID, TEST_BASIC_FORM_2_PAGE_3_ID],
      "_id":"527d4539639f521e0a007333"
    }
  ],
  "fieldRules":[
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 3"
      }],
      "targetField": TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
      "_id":"527d4539639f521e0a054321"
    },
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 5"
      }],
      "targetField": TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID,
      "_id":"527d4539639f521e0a001234"
    }
  ],
  "pages":[
    {
      "name":TEST_BASIC_FORM_2_PAGE_1_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_FORM_2_PAGE_1_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_NAME,
          "helpText":"This is a text field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_TYPE,
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
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_NAME,
          "helpText":"This is a text area field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_TYPE,
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
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_NAME,
          "helpText":"This is a number field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_4_NAME,
          "helpText":"This is a sectionBreak field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_4_TYPE, //"sectionBreak",
          "required":false,
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_NAME,
          "helpText":"This is a Email field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_TYPE, //"emailAddress",
          "required":true,
          "fieldOptions":{
          },
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID,
          "repeating":false
        }
      ]
    },
    {
      "name":TEST_BASIC_FORM_2_PAGE_2_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_FORM_2_PAGE_2_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_NAME,
          "helpText":"This is a text field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_TYPE,
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
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME,
          "helpText":"This is a text area field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_TYPE,
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
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_NAME,
          "helpText":"This is a number field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_4_NAME,
          "helpText":"This is a sectionBreak field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_4_TYPE, //"sectionBreak",
          "required":false,
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_NAME,
          "helpText":"This is a Email field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_TYPE, //"emailAddress",
          "required":true,
          "fieldOptions":{
          },
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID,
          "repeating":false
        }
      ]
    },
    {
      "name":TEST_BASIC_FORM_2_PAGE_3_NAME,
      "description":"This is a test page 3 for the win.",
      "_id":TEST_BASIC_FORM_2_PAGE_3_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_2_PAGE_3_FIELD_6_NAME,
          "helpText":"This is a text field on page 3",
          "type":TEST_BASIC_FORM_2_PAGE_3_FIELD_6_TYPE,
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
          "_id":TEST_BASIC_FORM_2_PAGE_3_FIELD_6_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME,
          "helpText":"This is another text field on page 3",
          "type":TEST_BASIC_FORM_2_PAGE_3_FIELD_7_TYPE,
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
          "_id":TEST_BASIC_FORM_2_PAGE_3_FIELD_7_ID,
          "repeating":false
        }
      ]
    }
  ],
  "pageRef":{
    TEST_BASIC_FORM_2_PAGE_1_ID:0,
    TEST_BASIC_FORM_2_PAGE_2_ID:1
  },
  "fieldRef": {
    TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID: {
      "page":0,
      "field":0
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID: {
      "page":0,
      "field":1
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID: {
      "page":0,
      "field":2
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID: {
      "page":0,
      "field":3
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID: {
      "page":0,
      "field":4
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID: {
      "page":1,
      "field":0
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID: {
      "page":1,
      "field":1
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID: {
      "page":1,
      "field":2
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID: {
      "page":1,
      "field":3
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID: {
      "page":1,
      "field":4
    },
    TEST_BASIC_FORM_2_PAGE_3_FIELD_6_ID: {
      "page":2,
      "field":1
    },
    TEST_BASIC_FORM_2_PAGE_3_FIELD_7_ID: {
      "page":2,
      "field":2
    }
  },
  "appsUsing":123,
  "submissionsToday":1234,
  "submissionsTotal":124125
};

var TEST_BASIC_FORM_2_SUBMISSION_1 = {
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
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
         "fieldValues":[
            12345
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID,
         "fieldValues":[
            "value for email field"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID,
         "fieldValues":[
            12345
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID,
         "fieldValues":[
            "value for email field"
         ]
      }

   ]
};

/**
 * START ADMIN Form Testing definition
 * @type {string}
 */

var TEST_BASIC_ADMIN_FORM_1_NAME = "TEST_BASIC_ADMIN_FORM_1_NAME";

var TEST_BASIC_ADMIN_FORM_1_PAGE_1_NAME = "TEST_BASIC_ADMIN_FORM_1_PAGE_1_NAME";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_ID = "000000000000000000000112";

var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_NAME = "TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_NAME";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_TYPE = "text";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID = "000000000000000000000113";

var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_NAME = "TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_NAME";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_TYPE = "number";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID = "000000000000000000000114";

var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_NAME = "TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_NAME";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_TYPE = "text";
var TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID = "000000000000000000000115";

var TEST_BASIC_ADMIN_FORM_1_DEFINITION = { // no page or field rules
  "updatedBy":"user@example.com",
  "name":"TEST_BASIC_ADMIN_FORM_1_NAME",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing admin fields in the rules engine.",
  "_id":"527d4539639f521e0a000044",
  "pageRules":[],
  "fieldRules":[
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide field 3"
      }],
      "targetField": TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID,
      "_id":"527d4539639f521e0a054444"
    }
  ],
  "pages":[
    {
      "name":TEST_BASIC_ADMIN_FORM_1_PAGE_1_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_ADMIN_FORM_1_PAGE_1_ID,
      "fields":[
        {
          "name":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_NAME,
          "helpText":"This is a non-admin text field",
          "type":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max":100
            }
          },
          "_id":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_NAME,
          "helpText":"This is a number admin field",
          "type":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":3
            },
            "validation":{
              "min":0,
              "max":41
            }
          },
          "_id":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID,
          "repeating":false,
          "adminOnly": true
        },
        {
          "name":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_NAME,
          "helpText":"This is a number admin field",
          "type":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":3
            },
            "validation":{
              "min":0,
              "max":41
            }
          },
          "_id":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID,
          "repeating":false,
          "adminOnly": false
        }
      ]
    }
  ],
  "pageRef":{
    TEST_BASIC_ADMIN_FORM_1_PAGE_1_ID:0
  },
  "fieldRef": {
    TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID: {
      "page":0,
      "field":0
    },
    TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID: {
      "page":0,
      "field":1
    },
    TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID: {
      "page":0,
      "field":2
    }
  },
  "appsUsing":123,
  "submissionsToday":1234,
  "submissionsTotal":124125
};

/**
 * Submission to test that an admin field is not considered when validating a submission
 * @type {{appId: string, appCloudName: string, timezoneOffset: number, appEnvironment: string, deviceId: string, deviceFormTimestamp: number, comments: Array, formFields: Array}}
 */
var TEST_BASIC_ADMIN_FORM_1_SUBMISSION_1 = {
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
      "fieldId":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID,
      "fieldValues":[
        "hide field 3"
      ]
    },
    {
      "fieldId":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID,
      "fieldValues":[
        "field 3 text"
      ]
    }
  ]
};

/**
 * Submission to test that an admin field is not considered when validating a submission.
 * If an admin field is submitted to the rules engine, it should produce an error. Any submission to the rules engine containing admin fields is an error.
 * @type {{appId: string, appCloudName: string, timezoneOffset: number, appEnvironment: string, deviceId: string, deviceFormTimestamp: number, comments: Array, formFields: Array}}
 */
var TEST_BASIC_ADMIN_FORM_1_SUBMISSION_2 = {
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
      "fieldId":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID,
      "fieldValues":[
        "value for text field (1)"
      ]
    },
    {
      "fieldId":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID,
      "fieldValues":[
        43
      ]
    },
    {
      "fieldId":TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID,
      "fieldValues":[
        "field 3 text"
      ]
    }
  ]
};

/**
 * END ADMIN Form Testing definition
 */

/**
 * An admin form checking rules should process rules as normal.
 * @param finish
 */
module.exports.testAdminFormCorrectSubmission = function(finish){
  var engine = formsRulesEngine(TEST_BASIC_ADMIN_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_ADMIN_FORM_1_SUBMISSION_1);

  var tests = [
    {
      submission: TEST_BASIC_ADMIN_FORM_1_SUBMISSION_1,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: false}
      ],
      pagesToCheck: [
      ]
    }
  ];

  async.eachSeries(tests,
    function (oneTest, cb) {
      engine.checkRules(oneTest.submission, function (err, results) {
        assert.ok(!err);
        assert.ok(results);
        assert.ok(results.actions);
        assert.ok(results.actions.fields);
        assert.equal(Object.keys(results.actions.fields).length, 1, 'Should only be 1 fields listed, since only 1 targets specified in rules');
        assert.ok(results.actions.pages);
        assert.equal(Object.keys(results.actions.pages).length, 0, 'Should be 0 pages listed, since 0 page targets specified in rules - actions: ' + util.inspect(results.actions));

        async.series([
          function(cb) {
            async.each(oneTest.fieldsToCheck, function (fieldTest, cb) {
              assert.ok(results.actions.fields[fieldTest.fieldID + '_0'], 'expected field ' + fieldTest.fieldID + ' not listed in results: ' + util.inspect(results.actions.fields));
              assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].targetId, fieldTest.fieldID);
              assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].action, fieldTest.expectedVisible?"show":"hide", 'expected action ' + (fieldTest.expectedVisible?"show":"hide") + ', for field: ' + fieldTest.fieldID);
              return cb();
            }, function (err) {
              assert.ok(!err);
              return cb();
            });
          },
          function(cb) {
            async.each(oneTest.pagesToCheck, function (pageTest, cb) {
              assert.ok(results.actions.pages[pageTest.pageID], 'expected page ' + pageTest.pageID + ' not listed in results: ' + util.inspect(results.actions.pages));
              assert.equal(results.actions.pages[pageTest.pageID].targetId, pageTest.pageID);
              assert.equal(results.actions.pages[pageTest.pageID].action, pageTest.expectedVisible?"show":"hide", 'expected action ' + (pageTest.expectedVisible?"show":"hide") + ', for page: ' + pageTest.pageID);
              return cb();
            }, function (err) {
              assert.ok(!err);
              return cb();
            });
          }
        ], function (err) {
          assert.ok(!err);
          return cb();
        });
      });
    }, function (err) {
      assert.ok(!err);
      finish();
    });
};

/**
 * Testing that processing rules on a submission that contains admin fields in the submission is an error.
 * @param finish
 */
module.exports.testAdminFormSubmissionContainingAdminField = function(finish){
  var engine = formsRulesEngine(TEST_BASIC_ADMIN_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_ADMIN_FORM_1_SUBMISSION_2);

  engine.checkRules(TEST_BASIC_ADMIN_FORM_1_SUBMISSION_2, function (err, results) {
    assert.ok(err, "Expected an error when checking rules on an admin field");
    assert.ok(err.indexOf("Admin fields cannot be passed to the rules engine") > -1, "Expected field error to be admin field error but was " + err.message);
    assert.ok(err.indexOf(TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID > -1), "Expected the error field to be " + TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID + " ", util.inspect(err));
    finish();
  });
};

module.exports.testBasicForm2SpecificFieldsVisible = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_2_SUBMISSION_1);

  async.each([
    TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
    TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
    TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID,
    TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID, TEST_BASIC_FORM_2_PAGE_3_FIELD_6_ID, TEST_BASIC_FORM_2_PAGE_3_FIELD_7_ID
  ], function (fieldID, cb) {
    engine.isFieldVisible(fieldID, true, function(err,visible) {
      assert.ok(!err, 'validation should not have returned error, for fieldID:' + fieldID + ' - err: ' + util.inspect(err));
      assert.ok(!err, 'validation should not have returned error - err: ' + util.inspect(err));
      assert.ok(true === visible, 'Field:' + fieldID + ' should be marked as visible');
      return cb();
    });
  }, function(err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1SpecificFieldsVisibleWithFieldsOnPage2Invisible = function (finish) {
  var TEST_BASIC_FORM_2_SUBMISSION_2 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_2_SUBMISSION_1));
  TEST_BASIC_FORM_2_SUBMISSION_2.formFields[1].fieldValues[0] = "hide page 2";   //  This should trigger rule that causes all fields on page 2 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_2_SUBMISSION_2);

  async.each([
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_3_FIELD_6_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_3_FIELD_7_ID, expectedVisible: true}
  ], function (field, cb) {
    engine.isFieldVisible(field.fieldID, true, function(err,visible) {
      assert.ok(!err, 'validation should not have returned error, for fieldID:' + field.fieldID + ' - err: ' + util.inspect(err));
      assert.ok(field.expectedVisible === visible, 'Field:' + field.fieldID + ' should ' + (field.expectedVisible?"":" NOT ") + 'be marked as visible');
      return cb();
    });
  }, function (err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1SpecificFieldsVisibleWithFieldsOnPage2AndPage3Invisible = function (finish) {
  var TEST_BASIC_FORM_2_SUBMISSION_3 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_2_SUBMISSION_1));
  TEST_BASIC_FORM_2_SUBMISSION_3.formFields[0].fieldValues[0] = "hide page 2 and 3";   //  This should trigger rule that causes all fields on page 2 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_2_SUBMISSION_3);

  async.each([
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_3_FIELD_6_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_3_FIELD_7_ID, expectedVisible: false}
  ], function (field, cb) {
    engine.isFieldVisible(field.fieldID, true, function(err,visible) {
      assert.ok(!err, 'validation should not have returned error, for fieldID:' + field.fieldID + ' - err: ' + util.inspect(err));
      assert.ok(field.expectedVisible === visible, 'Field:' + field.fieldID + ' should ' + (field.expectedVisible?"":" NOT ") + 'be marked as visible');
      return cb();
    });
  }, function (err) {
    assert.ok(!err);
    finish();
  });
};


module.exports.testBasicForm2CheckRulesHidingPage2 = function (finish) {
  var TEST_BASIC_FORM_2_SUBMISSION_2 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_2_SUBMISSION_1));
  TEST_BASIC_FORM_2_SUBMISSION_2.formFields[1].fieldValues[0] = "hide page 2";   //  This should trigger rule that causes all fields on page 2 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);

  var tests = [
    {
      submission: TEST_BASIC_FORM_2_SUBMISSION_2,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID, expectedVisible: true},
        { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, expectedVisible: true}
      ],
      pagesToCheck: [
        { pageID: TEST_BASIC_FORM_2_PAGE_2_ID, expectedVisible: false},
        { pageID: TEST_BASIC_FORM_2_PAGE_3_ID, expectedVisible: true}
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
        assert.equal(Object.keys(results.actions.fields).length, 2, 'Should only be 2 fields listed, since only 2 targets specified in rules');
        assert.ok(results.actions.pages);
        assert.equal(Object.keys(results.actions.pages).length, 2, 'Should be 2 pages listed, since 2 page targets specified in rules - actions: ' + util.inspect(results.actions));

        async.series([
          function(cb) {
            async.each(oneTest.fieldsToCheck, function (fieldTest, cb) {
              assert.ok(results.actions.fields[fieldTest.fieldID + '_0'], 'expected field ' + fieldTest.fieldID + ' not listed in results: ' + util.inspect(results.actions.fields));
              assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].targetId, fieldTest.fieldID);
              assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].action, fieldTest.expectedVisible?"show":"hide", 'expected action ' + (fieldTest.expectedVisible?"show":"hide") + ', for field: ' + fieldTest.fieldID);
              return cb();
            }, function (err) {
              assert.ok(!err);
              return cb();
            });
          },
          function(cb) {
            async.each(oneTest.pagesToCheck, function (pageTest, cb) {
              assert.ok(results.actions.pages[pageTest.pageID], 'expected page ' + pageTest.pageID + ' not listed in results: ' + util.inspect(results.actions.pages));
              assert.equal(results.actions.pages[pageTest.pageID].targetId, pageTest.pageID);
              assert.equal(results.actions.pages[pageTest.pageID].action, pageTest.expectedVisible?"show":"hide", 'expected action ' + (pageTest.expectedVisible?"show":"hide") + ', for page: ' + pageTest.pageID);
              return cb();
            }, function (err) {
              assert.ok(!err);
              return cb();
            });
          }
        ], function (err) {
          assert.ok(!err);
          return cb();
        });
      });
    }, function (err) {
      assert.ok(!err);
      finish();
  });
};

//Testing hiding page 2 and page 3.
module.exports.testBasicForm2CheckRulesHidingPage2AndPage3 = function (finish) {
  var TEST_BASIC_FORM_2_SUBMISSION_2 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_2_SUBMISSION_1));
  TEST_BASIC_FORM_2_SUBMISSION_2.formFields[0].fieldValues[0] = "hide page 2 and 3";   //  This should trigger rule that causes all fields on page 2 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);

  var tests = [
    {
      submission: TEST_BASIC_FORM_2_SUBMISSION_2,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID, expectedVisible: true},
        { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, expectedVisible: true}
      ],
      pagesToCheck: [
        { pageID: TEST_BASIC_FORM_2_PAGE_2_ID, expectedVisible: false},
        { pageID: TEST_BASIC_FORM_2_PAGE_3_ID, expectedVisible: false}
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
        assert.equal(Object.keys(results.actions.fields).length, 2, 'Should only be 2 fields listed, since only 2 targets specified in rules');
        assert.ok(results.actions.pages);
        assert.equal(Object.keys(results.actions.pages).length, 2, 'Should be 2 pages listed, since 2 page targets specified in rules - actions: ' + util.inspect(results.actions));

        async.series([
          function(cb) {
            async.each(oneTest.fieldsToCheck, function (fieldTest, cb) {
              assert.ok(results.actions.fields[fieldTest.fieldID + '_0'], 'expected field ' + fieldTest.fieldID + ' not listed in results: ' + util.inspect(results.actions.fields));
              assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].targetId, fieldTest.fieldID);
              assert.equal(results.actions.fields[fieldTest.fieldID + '_0'].action, fieldTest.expectedVisible?"show":"hide", 'expected action ' + (fieldTest.expectedVisible?"show":"hide") + ', for field: ' + fieldTest.fieldID);
              return cb();
            }, function (err) {
              assert.ok(!err);
              return cb();
            });
          },
          function(cb) {
            async.each(oneTest.pagesToCheck, function (pageTest, cb) {
              assert.ok(results.actions.pages[pageTest.pageID], 'expected page ' + pageTest.pageID + ' not listed in results: ' + util.inspect(results.actions.pages));
              assert.equal(results.actions.pages[pageTest.pageID].targetId, pageTest.pageID);
              assert.equal(results.actions.pages[pageTest.pageID].action, pageTest.expectedVisible?"show":"hide", 'expected action ' + (pageTest.expectedVisible?"show":"hide") + ', for page: ' + pageTest.pageID);
              return cb();
            }, function (err) {
              assert.ok(!err);
              return cb();
            });
          }
        ], function (err) {
          assert.ok(!err);
          return cb();
        });
      });
    }, function (err) {
      assert.ok(!err);
      finish();
    });
};
