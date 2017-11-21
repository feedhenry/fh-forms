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

var TEST_BASIC_FORM_1_PAGE_1_FIELD_6_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_6_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_6_TYPE = "file";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID = "000000000000000000000007";


var TEST_BASIC_FORM_1_PAGE_1_FIELD_7_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_7_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_7_TYPE = "photo";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID = "000000000000000000000008";

var TEST_BASIC_FORM_1_PAGE_1_FIELD_8_NAME = "TEST_BASIC_FORM_1_PAGE_1_FIELD_8_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_8_TYPE = "text";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID = "000000000000000000000009";

var TEST_BASIC_FORM_1_PAGE_1_FIELD_9_NAME_NUMBERTEST = "TEST_BASIC_FORM_1_PAGE_1_FIELD_9_NAME";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_9_TYPE_NUMBERTEST = "number";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST = "000000000000000000000010";
var TEST_BASIC_FORM_1_PAGE_1_FIELD_9_MAX_VALUE_NUMBERTEST = 100;


/**
 * START ADMIN Form Testing deinition
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


var TEST_BASIC_ADMIN_FORM_1_DEFINITION = { // no page or field rules
  "updatedBy":"user@example.com",
  "createdBy":"test@example.com",
  "name":"TEST_BASIC_ADMIN_FORM_1_NAME",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing admin fields in the rules engine.",
  "_id":"527d4539639f521e0a000044",
  "pageRules":[],
  "fieldRules":[],
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
        "value for text field (1)"
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
    }
  ]
};

/**
 * END ADMIN Form Testing definition
 */

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

var TEST_BASIC_FORM_2_DEFINITION = { // no page or field rules
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
              "min":0,
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
              "min":0,
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

var TEST_BASIC_FORM_1_SUBMISSION_MULTIPLE_TARGETS = {
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

var TEST_BASIC_FORM_1_SUBMISSION_MULTIPLE_TARGETS_ALL_SHOWN = {
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
        "show 5 and 1"
      ]
    },
    {
      "fieldId":TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID,
      "fieldValues":[
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

var TEST_BASIC_FORM_1_SUBMISSION_REQUIRED_FIELD_MISSING = {
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

var TEST_BASIC_FORM_1_SUBMISSION_REQUIRED_FIELD_EMPTY = {
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
            ""
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


var TEST_BASIC_FORM_1_SUBMISSION_OPTIONAL_FIELD_MISSING = {
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

/**
 * Used to validate that a rule can "show" and "hide" multiple fields.
 * @type {{updatedBy: string, name: string, lastUpdated: string, lastUpdatedTimestamp: number, dateCreated: string, description: string, _id: string, pageRules: Array, fieldRules: Array, pages: Array, pageRef: {TEST_BASIC_FORM_1_PAGE_1_ID: number}, fieldRef: {TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID: {page: number, field: number}, TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID: {page: number, field: number}, TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID: {page: number, field: number}, TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID: {page: number, field: number}, TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID: {page: number, field: number}}, appsUsing: number, submissionsToday: number, submissionsTotal: number}}
 */
var TEST_BASIC_FORM_1_MULTIPLE_FIELD_TARGETED = {
  "updatedBy":"user@example.com",
  "createdBy":"user@example.com",
  "name":"TEST_BASIC_FORM_1_MULTIPLE_FIELD_TARGETED",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing rules.",
  "_id":"527d4539639f521e0a000054",
  "pageRules":[],
  "fieldRules":[
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 3 and 4"
      }],
      "targetField": [TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID],
      "_id":"527d4539639f521e0a059876"
    },
    {
      "type": "show",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "show 5 and 1"
      }],
      "targetField": [TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID],
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


module.exports.testAdminFieldsNotConsidered = function(finish){
  var engine = formsRulesEngine(TEST_BASIC_ADMIN_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_ADMIN_FORM_1_SUBMISSION_1);

  async.each([
    { fieldID: TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true}
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

module.exports.testAdminFieldsNotConsideredAdminFieldSubmitted = function(finish){
  var engine = formsRulesEngine(TEST_BASIC_ADMIN_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_ADMIN_FORM_1_SUBMISSION_2);

  engine.isFieldVisible(TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_2_ID, true, function(err,visible) {
    assert.ok(err, 'validation should  have returned error, for fieldID:' + TEST_BASIC_ADMIN_FORM_1_PAGE_1_FIELD_1_ID + ' - err: null');
    assert.ok(err.message.indexOf('Admin fields cannot be passed to the rules engine') > -1);
    finish();
  });
};

module.exports.testBasicForm1AllFieldsVisible = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_1);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
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


module.exports.testBasicForm1ValidateForOptionalFieldMissing = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_OPTIONAL_FIELD_MISSING, function (err, results) {
    assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'should not have entry for missing optional fields: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));
    finish();
  });
};


module.exports.testBasicForm1ValidateForRequiredFieldMissing = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_REQUIRED_FIELD_MISSING, function (err, results) {
    assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
    assert.ok(!results.validation.valid, "unexpected valid result: " + util.inspect(results.validation));
    assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'should be error for missing required field - ' + util.inspect(results.validation));
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].valid, 'missing required field should be marked as invalid');
    assert.equal(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].fieldErrorMessage.length, 1, 'should be 1 error message for missing required field - was: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].fieldErrorMessage));
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].errorMessages, 'should not be field value specific error message for missing required field - was: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].errorMessages));

    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], "unexpected error results for field5: " + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

    finish();
  });
};

module.exports.testBasicForm1ValidateForRequiredFieldEmpty = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_2_DEFINITION);
  engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_REQUIRED_FIELD_EMPTY, function (err, results) {
    assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
    assert.ok(results.validation, "expected validation results: " + util.inspect(results.validation));
    assert.strictEqual(results.validation.valid, false, "expected invalid result: " + util.inspect(results.validation));
    assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'should be error for empty required field - ' + util.inspect(results));
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].valid, 'empty required field should be marked as invalid');
    assert.equal(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].fieldErrorMessage.length, 1, 'should be 1 error message for missing required field - was: ' + util.inspect(results));
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].errorMessages, 'should not be field value specific error message for missing required field - was: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID].errorMessages));

    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], "unexpected error results for field5: " + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

    finish();
  });
};

module.exports.testBasicForm1ValidateForm = function (finish) {
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_1, function (err, results) {
    assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
    assert.ok(results.validation.valid, "unexpected invalid result: " + util.inspect(results.validation));
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
    assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

    finish();
  });
};

module.exports.testBasicForm1ValidateFormInvalid = function (finish) {
  var TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE + 1;   //  This should trigger an invalid form, field 3 value is greater than max

  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);

  async.series([
    function (cb) {
      engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD, function (err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
        assert.ok(!results.validation.valid, "Expected invalid result: " + util.inspect(results.validation));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3, which is in error');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked invalid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length > 0, 'Field 3 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[0].indexOf("max") > -1, 'Field 3 should complain about max value' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function (cb) {
      // change field to value within range, form should no validate
      TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE;
      engine.validateForm(TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD, function (err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
        assert.ok(results.validation.valid, "unexpected invalid result: " + util.inspect(results.validation));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
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


/**
 * This test validates that a field rule targeting multiple fields actions upon multiple fields. Satisfying none of the rule conditions should mark fields 2 and 5 to be hidden.
 * @param finish
 */
module.exports.testBasicForm1ValidateMultipleTargets = function (finish){
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_MULTIPLE_FIELD_TARGETED);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_MULTIPLE_TARGETS);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: false}
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


/**
 * This test validates that a field rule targeting multiple fields actions upon multiple fields. Satisfying the show condition should mark all fields as visible.
 * @param finish
 */
module.exports.testBasicForm1ValidateMultipleTargets = function (finish){
  var engine = formsRulesEngine(TEST_BASIC_FORM_1_MULTIPLE_FIELD_TARGETED);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_MULTIPLE_TARGETS_ALL_SHOWN);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
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


// sample result from validateField
// engine.validateField(fieldId, submissionJSON, function(err,res) {});
// // validate only field values on validation (no rules, no repeat checking)
// res:
// "validation":{
//         "fieldId":{
//             "fieldId":"",
//             "valid":true,
//             "errorMessages":[
//                 "length should be 3 to 5",
//                 "should not contain dammit"
//             ]
//         }
//     }
module.exports.testBasicForm1ValidateFieldInvalid = function testBasicForm1ValidateFieldInvalid(finish) {
  var TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE + 1;   //  This should trigger an invalid field, field 3 has max value specified as 100
  assert.equal(TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldId, TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, 'This test expects FIELD3 to be in index 2 of submission.formFields')

  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);

  async.series([
    function testInvalid(cb) {
      engine.validateField(TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked invalid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length > 0, 'Field 3 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[0].indexOf("max") > -1, 'Field 3 should complain about max value' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      // change field to value within range, field should now validate
      TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE;
      engine.validateField(TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD, function testValidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked valid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have an error message array');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length === 1, 'Field 3 should have 1 error message placeholder: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[0], 'Field 3 should have 1 error message placeholder with null: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueRequiredTextFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_NAME,
    "helpText":"This is a text field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_TYPE,
    "required":true,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueRequiredNumberFields = function testBasicForm1ValidateFieldValueRequiredNumberFields(finish) {
  var numberField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_9_NAME_NUMBERTEST,
    "helpText":"This is a number field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_9_TYPE_NUMBERTEST,
    "required":true,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(numberField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentEmptyString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotNumeric(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "hello", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotNumericSuffix(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "27x", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotNumericPrefix(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "x27", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumericString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "27", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumericString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, " 27 ", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumeric(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, 27, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueOptionalNumberFields = function testBasicForm1ValidateFieldValueOptionalNumberFields(finish) {
  var numberField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_9_NAME_NUMBERTEST,
    "helpText":"This is a number field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_9_TYPE_NUMBERTEST,
    "required":false,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(numberField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentEmptyString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotNumeric(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "hello", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotNumericSuffix(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "27x", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotNumericPrefix(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "x27", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumericString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "27", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumericString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, " 27 ", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumericBlankString(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, "  ", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValidNumeric(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST, 27, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST], 'Should be details for field 9');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST].valid, 'Optional Field 9 should be marked Valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_9_ID_NUMBERTEST]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueOptionalTextFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_NAME,
    "helpText":"This is a file field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_TYPE,
    "required":false,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueRepeatingTextFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_NAME,
    "helpText":"This is a file field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_TYPE,
    "required":false,
    "fieldOptions":{
      "definition": {
        "minRepeat": 2
      }
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID,
    "repeating":true
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, undefined, 0, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, null, 1, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID, null, 2, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID], 'Should be details for field 8');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID].valid, 'Field 8 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_8_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueRequiredFileFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_6_NAME,
    "helpText":"This is a file field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_6_TYPE,
    "required":true,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages[0].indexOf("required") > -1, 'Field 6 should complain about required input' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages[0].indexOf("required") > -1, 'Field 6 should complain about required input' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidObj(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidName(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, {name:"", size:1}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidSize(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID,{name:"hello.txt", size:0}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages[0].indexOf("Expected") > -1, 'Field 6 should complain about Expected value: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, {name:"hello.txt", size:1}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message array');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have error messages: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueOptionalFileFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_6_NAME,
    "helpText":"This is a file field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_6_TYPE,
    "required":false,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length == 0, 'Field 6 should have no error messages');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length == 0, 'Field 6 should have no error messages');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidObj(cb) {  // empty string is used for unspecified fields, unspecified optional field is valid
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length == 0, 'Field 6 should have no error messages');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidName(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, {name:"", size:1}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidSize(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID,{name:"hello.txt", size:0}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages[0].indexOf("Expected") > -1, 'Field 6 should complain about Expected value: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID, {name:"hello.txt", size:1}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID], 'Should be details for field 6');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].valid, 'Field 6 should be marked invalid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages, 'Field 6 should have an error message array');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages.length > 0, 'Field 6 should have error messages: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_6_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};


module.exports.testBasicForm1ValidateFieldValueRequiredPhotoFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_7_NAME,
    "helpText":"This is a photo field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_7_TYPE,
    "required":true,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);
  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length > 0, 'Field 7 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages[0].indexOf("required") > -1, 'Field 7 should complain about required input' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length > 0, 'Field 7 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages[0].indexOf("required") > -1, 'Field 7 should complain about required input' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidObj(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpe cted error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length > 0, 'Field 7 should have at least one error message');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidName(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, {name:"", size:1}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length > 0, 'Field 7 should have at least one error message');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, "ThisIsAMockBase64String", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked valid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message array');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length === 0, 'Field 7 should have no error messages: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValueOptionalPhotoFields = function testBasicForm1ValidateFieldValueFileFields(finish) {
  var fileField = {
    "name":TEST_BASIC_FORM_1_PAGE_1_FIELD_7_NAME,
    "helpText":"This is a photo field",
    "type":TEST_BASIC_FORM_1_PAGE_1_FIELD_7_TYPE,
    "required":false,
    "fieldOptions":{
    },
    "_id":TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID,
    "repeating":false
  };

  var form = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  form.pages[0].fields.push(fileField);

  var engine = formsRulesEngine(form);

  async.series([
    function testInvalidNotPresentUndefined(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, undefined, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length == 0, 'Field 7 should have no error messages');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidNotPresentNull(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, null, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length == 0, 'Field 7 should have no error messages');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidObj(cb) {  // empty string is unspecified field
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, "", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked valid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length == 0, 'Field 7 should have no error messages');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testInvalidName(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, {name:"", size:1}, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length > 0, 'Field 7 should have at least one error message');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID, "ThisIsAMockBase64String", function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID], 'Should be details for field 7');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].valid, 'Field 7 should be marked valid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages, 'Field 7 should have an error message array');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages.length === 0, 'Field 7 should have no error messages: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_7_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};

module.exports.testBasicForm1ValidateFieldValue = function testBasicForm1ValidateFieldValue(finish) {
  var TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE + 1;   //  This should trigger an invalid field, field 3 has max value specified as 100
  assert.equal(TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldId, TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, 'This test expects FIELD3 to be in index 2 of submission.formFields')

  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);

  async.series([
    function testInvalid(cb) {
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE + 1, function testInvalidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateField: ' + util.inspect(err));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]);
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3');

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked invalid: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID]));
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have an error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length > 0, 'Field 3 should have at least one error message');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages[0].indexOf("max") > -1, 'Field 3 should complain about max value' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]);
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]);

        return cb();
      });
    },
    function testValid(cb) {
      // change field to value within range, field should now validate
      TEST_BASIC_FORM_1_SUBMISSION_TEST_INVALID_FIELD.formFields[2].fieldValues[0] = TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE;
      engine.validateFieldValue(TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, TEST_BASIC_FORM_1_PAGE_1_FIELD_3_MAX_VALUE, function testValidCallback(err, results) {
        assert.ok(!err, 'unexpected error from validateForm: ' + util.inspect(err));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID]));

        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID], 'Should be details for field 3');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].valid, 'Field 3 should be marked valid');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages, 'Field 3 should have an error message array');
        assert.ok(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages.length === 0, 'Field 3 should have no error messages: ' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID].errorMessages));

        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID]));
        assert.ok(!results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID], 'Unexpected results for TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID' + util.inspect(results.validation[TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID]));

        return cb();
      });
    }
  ], function (err) {
    assert.ok(!err, "Unexpected error: " + util.inspect(err));
    finish();
  });
};

module.exports.testBasicForm1SpecificFieldsVisibleWithField3Invisible = function (finish) {

  var TEST_BASIC_FORM_1_SUBMISSION_2 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_2.formFields[0].fieldValues[0] = "hide 3";   //  This should trigger rule that causes field 3 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_2);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
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



module.exports.testBasicForm1SpecificFieldsVisibleWithField5Invisible = function (finish) {

  var TEST_BASIC_FORM_1_SUBMISSION_3 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_3.formFields[0].fieldValues[0] = "hide 5";   //  This should trigger rule that causes field 5 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_3);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: false}
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

module.exports.testBasicForm1SpecificFieldsVisibleWithFields3and5Invisible = function (finish) {

  var TEST_BASIC_FORM_1_SUBMISSION_4 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_BASIC_FORM_1_SUBMISSION_4.formFields[0].fieldValues[0] = "hide 3 hide 5";   //  This should trigger rule that causes fields 3 & 5 to be hidden

  var engine = formsRulesEngine(TEST_BASIC_FORM_1_DEFINITION);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_4);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: false}
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

module.exports.testBasicForm1FieldSetToShowInRule = function (finish) {

  var TEST_FORM_WITH_A_RULE_SET_TO_SHOW_A_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  var NEW_RULE =  {
    "type": "show",
    "ruleConditionalOperator": "and",
    "ruleConditionalStatements": [{
      "sourceField": TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID,
      "restriction": "contains",
      "sourceValue": "show 4"
    }],
    "targetField": TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID,
    "_id":"527d4539639f521e0a001235"
  };
  TEST_FORM_WITH_A_RULE_SET_TO_SHOW_A_FIELD.fieldRules.push(NEW_RULE);

  var TEST_SUBMISSION_WITH_SHOW_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_SUBMISSION_WITH_SHOW_FIELD.formFields[1].fieldValues[0] = "show 4";   //  This should trigger rule that causes fields 4 to be shown

  var engine = formsRulesEngine(TEST_FORM_WITH_A_RULE_SET_TO_SHOW_A_FIELD);
  engine.initSubmission(TEST_BASIC_FORM_1_SUBMISSION_1);

  async.each([
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: false},  // if rule set to show a field, it should start as hidden
    { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
  ], function (field, cb) {
    engine.isFieldVisible(field.fieldID, true, function(err,visible) {
      assert.ok(!err, 'validation should not have returned error, for fieldID:' + field.fieldID + ' - err: ' + util.inspect(err));
      assert.ok(field.expectedVisible === visible, 'Field:' + field.fieldID + ' should ' + (field.expectedVisible?"":" NOT ") + 'be marked as visible');
      return cb();
    });
  }, function (err) {
    assert.ok(!err);
    engine.initSubmission(TEST_SUBMISSION_WITH_SHOW_FIELD);

    async.each([
      { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_1_ID, expectedVisible: true},
      { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID, expectedVisible: true},
      { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
      { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},  // if rule set to show a field, it should start as hidden
      { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
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
  });
};

module.exports.testBasicFormCheckRulesFieldSetToShowInRule = function (finish) {
  var TEST_FORM_WITH_A_RULE_SET_TO_SHOW_A_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_DEFINITION));
  var NEW_RULE =  {
    "type": "show",
    "ruleConditionalOperator": "and",
    "ruleConditionalStatements": [{
      "sourceField": TEST_BASIC_FORM_1_PAGE_1_FIELD_2_ID,
      "restriction": "contains",
      "sourceValue": "show 4"
    }],
    "targetField": TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID,
    "_id":"527d4539639f521e0a001235"
  };
  TEST_FORM_WITH_A_RULE_SET_TO_SHOW_A_FIELD.fieldRules.push(NEW_RULE);

  var engine = formsRulesEngine(TEST_FORM_WITH_A_RULE_SET_TO_SHOW_A_FIELD);

  var TEST_SUBMISSION_WITH_SHOW_FIELD = JSON.parse(JSON.stringify(TEST_BASIC_FORM_1_SUBMISSION_1));
  TEST_SUBMISSION_WITH_SHOW_FIELD.formFields[1].fieldValues[0] = "show 4";   //  This should trigger rule that causes fields 4 to be shown

  var tests = [
    {
      submission: TEST_BASIC_FORM_1_SUBMISSION_1,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: false},  // if rule set to show a field, it should start as hidden
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_5_ID, expectedVisible: true}
      ]
    },
    {
      submission: TEST_SUBMISSION_WITH_SHOW_FIELD,
      fieldsToCheck: [
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_3_ID, expectedVisible: true},
        { fieldID: TEST_BASIC_FORM_1_PAGE_1_FIELD_4_ID, expectedVisible: true},  // if rule set to show a field, it should start as hidden
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
        assert.equal(Object.keys(results.actions.fields).length, 3, 'Should only be 3 fields listed, since only 3 targets specified in rules');
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


/**
 * This is a test of the admin fields in the rules engine.
 * The rules engine should not consider the admin fields when validating a submission
 */
