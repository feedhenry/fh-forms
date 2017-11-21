var async = require('async');
var util = require('util');
var assert = require('assert');

var formsRulesEngine = require('../../../lib/common/forms-rule-engine.js');

var TEST_FORMDEF_1 = {
      "updatedBy": "user@example.com",
      "createdBy": "user@example.com",
      "name": "testFieldsForm",
      "description": "This form is for testing fields.",
      "lastUpdatedTimestamp": 1385647845865,
      "lastUpdated": "2013-11-28T14:10:45.865Z",
      "dateCreated": "2013-11-28T14:10:45.865Z",
      "_id": "527d4539639f521e0a000004",
      "pageRules": [{
         "type": "show",
         "targetPage": "527d4539639f521e0a000005",
         "_id": "52974ee55e272dcb3d0000ad",
         "ruleConditionalStatements": [{
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "contains",
            "sourceValue": "val"
         }],
         "ruleConditionalOperator": "and"
      }, {
         "type": "show",
         "targetPage": "527d4539639f521e0a000005",
         "_id": "52974ee55e272dcb3d0000ae",
         "ruleConditionalStatements": [{
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "begins with",
            "sourceValue": "dammit"
         }],
         "ruleConditionalOperator": "and"
      }, {
         "type": "show",
         "targetPage": "527d4539639f521e0a000005",
         "_id": "52974ee55e272dcb3d0000af",
         "ruleConditionalStatements": [{
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "begins with",
            "sourceValue": "begin"
         }, {
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "ends with",
            "sourceValue": "dammit"
         }],
         "ruleConditionalOperator": "and"
      }, {
         "type": "show",
         "targetPage": "527d4539639f521e0a000005",
         "_id": "52974ee55e272dcb3d0000b0",
         "ruleConditionalStatements": [{
            "sourceField": "52974ee55e272dcb3d000098",
            "restriction": "is greater than",
            "sourceValue": "5"
         }, {
            "sourceField": "52974ee55e272dcb3d000098",
            "restriction": "is less than",
            "sourceValue": "23"
         }],
         "ruleConditionalOperator": "and"
      }],
      "fieldRules": [{
         "type": "hide",
         "targetField": "52974ee55e272dcb3d0000a6",
         "_id": "52974ee55e272dcb3d0000a9",
         "ruleConditionalStatements": [{
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "contains",
            "sourceValue": "val"
         }],
         "ruleConditionalOperator": "and"
      }, {
         "type": "show",
         "targetField": "52974ee55e272dcb3d0000a6",
         "_id": "52974ee55e272dcb3d0000aa",
         "ruleConditionalStatements": [{
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "begins with",
            "sourceValue": "dammit"
         }],
         "ruleConditionalOperator": "and"
      }, {
         "type": "show",
         "targetField": "52974ee55e272dcb3d0000a7",
         "_id": "52974ee55e272dcb3d0000ab",
         "ruleConditionalStatements": [{
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "begins with",
            "sourceValue": "begin"
         }, {
            "sourceField": "527d4539639f521e0a000006",
            "restriction": "ends with",
            "sourceValue": "dammit"
         }],
         "ruleConditionalOperator": "and"
      }, {
         "type": "show",
         "targetField": "52974ee55e272dcb3d0000a8",
         "_id": "52974ee55e272dcb3d0000ac",
         "ruleConditionalStatements": [{
            "sourceField": "52974ee55e272dcb3d000098",
            "restriction": "is greater than",
            "sourceValue": "5"
         }, {
            "sourceField": "52974ee55e272dcb3d000098",
            "restriction": "is less than",
            "sourceValue": "23"
         }],
         "ruleConditionalOperator": "and"
      }],
      "pages": [{
         "name": "testPage",
         "description": "This is a test page for the win.",
         "_id": "527d4539639f521e0a000005",
         "fields": [{
            "name": "textField",
            "helpText": "This is a text field",
            "type": "text",
            "required": true,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 5,
                  "minRepeat": 2
               },
               "validation": {
                  "min": 20,
                  "max": 100
               }
            },
            "_id": "527d4539639f521e0a000006",
            "repeating": true
         }, {
            "name": "textAreaField",
            "helpText": "This is a text area field",
            "type": "textarea",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 5,
                  "minRepeat": 3
               },
               "validation": {
                  "min": 5,
                  "max": 40
               }
            },
            "_id": "52974ee55e272dcb3d000097",
            "repeating": true
         }, {
            "name": "numberField",
            "helpText": "This is a number field",
            "type": "number",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 5,
                  "minRepeat": 2
               },
               "validation": {
                  "min": 5,
                  "max": 100
               }
            },
            "_id": "52974ee55e272dcb3d000098",
            "repeating": true
         }, {
            "name": "sectionBreakField",
            "helpText": "This is a sectionBreak field",
            "type": "sectionBreak",
            "required": false,
            "_id": "52974ee55e272dcb3d0000a4",
            "repeating": false
         }, {
            "name": "emailField",
            "helpText": "This is a Email field",
            "type": "emailAddress",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 5,
                  "minRepeat": 1
               }
            },
            "_id": "52974ee55e272dcb3d000099",
            "repeating": true
         }, {
            "name": "radioField",
            "helpText": "This is a Radio field",
            "type": "radio",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 2,
                  "minRepeat": 2,
                  "options": [{
                     "label": "radio1",
                     "checked": false
                  }, {
                     "label": "radio2",
                     "checked": false
                  }, {
                     "label": "radio3 checked",
                     "checked": true
                  }, {
                     "label": "radio4",
                     "checked": false
                  }]
               }
            },
            "_id": "52974ee55e272dcb3d00009a",
            "repeating": true
         }, {
            "name": "checkboxField",
            "helpText": "This is a Checkbox field",
            "type": "checkboxes",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "options": [{
                     "label": "red",
                     "value": 1,
                     "selected": true
                  }, {
                     "label": "blue",
                     "value": 2,
                     "selected": true
                  }, {
                     "label": "green",
                     "value": 3,
                     "selected": false
                  }, {
                     "label": "purple",
                     "value": 4,
                     "selected": false
                  }, {
                     "label": "black",
                     "value": 5,
                     "selected": false
                  }],
                  "minRepeat": 2,
                  "maxRepeat": 3
               },
               "validation": {
                  "min": 2,
                  "max": 3
               }
            },
            "_id": "52974ee55e272dcb3d00009d",
            "repeating": true
         }, {
            "name": "dropdownField",
            "helpText": "This is a dropdown field",
            "type": "dropdown",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 3,
                  "minRepeat": 2,
                  "options": [{
                     "label": "dropdownVal1",
                     "checked": false
                  }, {
                     "label": "dropdownVal2",
                     "checked": false
                  }, {
                     "label": "dropdownVal3",
                     "checked": true
                  }, {
                     "label": "dropdownVal4",
                     "checked": false
                  }]
               }
            },
            "_id": "52974ee55e272dcb3d00009b",
            "repeating": true
         }, {
            "name": "locationLatLongField",
            "helpText": "This is a locationLatLong field",
            "type": "location",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "locationUnit": "latLong",
                  "maxRepeat": 4,
                  "minRepeat": 2
               }

            },
            "_id": "52974ee55e272dcb3d00009e",
            "repeating": true
         }, {
            "name": "sectionBreak2Field",
            "helpText": "This is another sectionBreak field",
            "type": "sectionBreak",
            "required": false,
            "_id": "52974ee55e272dcb3d0000a5",
            "repeating": false
         }, {
            "name": "locationNorthEastField",
            "helpText": "This is a locationNorthEast field",
            "type": "location",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "locationUnit": "northEast",
                  "maxRepeat": 4,
                  "minRepeat": 2
               }

            },
            "_id": "52974ee55e272dcb3d00009f",
            "repeating": true
         }, {
            "name": "locationMapField",
            "helpText": "This is a locationMap field",
            "type": "locationMap",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 6,
                  "minRepeat": 1
               }
            },
            "_id": "52974ee55e272dcb3d0000a0",
            "repeating": true
         }, {
            "name": "dateField",
            "helpText": "This is a date field",
            "type": "dateTime",
            "required": false,
            "fieldOptions": {

               "definition": {
                  "dateTimeUnit": "date",
                  "timeAutopopulate": true,
                  "maxRepeat": 6,
                  "minRepeat": 1
               }
            },
            "_id": "52974ee55e272dcb3d0000a1",
            "repeating": true
         }, {
            "name": "timeField",
            "helpText": "This is a time field",
            "type": "dateTime",
            "required": false,
            "fieldOptions": {

               "definition": {
                  "dateTimeUnit": "time",
                  "timeAutopopulate": false,
                  "maxRepeat": 6,
                  "minRepeat": 2
               }
            },
            "_id": "52974ee55e272dcb3d0000a2",
            "repeating": true
         }, {
            "name": "dateTimeField",
            "helpText": "This is a dateTime field",
            "type": "dateTime",
            "required": false,
            "fieldOptions": {

               "definition": {
                  "dateTimeUnit": "dateTime",
                  "timeAutopopulate": true,
                  "maxRepeat": 6,
                  "minRepeat": 1
               }
            },
            "_id": "52974ee55e272dcb3d0000a3",
            "repeating": true
         }, {
            "name": "fileField",
            "helpText": "This is a file field",
            "type": "file",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "file_size": 100,
                  "maxRepeat": 5,
                  "minRepeat": 2
               }
            },
            "_id": "52974ee55e272dcb3d0000a6",
            "repeating": true
         }, {
            "name": "photoField",
            "helpText": "This is a photo field",
            "type": "photo",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "photoHeight": 200,
                  "photoWidth": 300,
                  "photoQuality": 50,
                  "maxRepeat": 5,
                  "minRepeat": 2
               }
            },
            "_id": "52974ee55e272dcb3d0000a7",
            "repeating": true
         }, {
            "name": "signatureField",
            "helpText": "This is a signature field",
            "type": "signature",
            "required": false,
            "fieldOptions": {
               "definition": {
                  "maxRepeat": 5,
                  "minRepeat": 2
               }
            },
            "_id": "52974ee55e272dcb3d0000a8",
            "repeating": true
         }]
      }],
      "pageRef": {
         "527d4539639f521e0a000005": 0
      },
      "fieldRef": {
         "527d4539639f521e0a000006": {
            "page": 0,
            "field": 0
         },
         "52974ee55e272dcb3d000097": {
            "page": 0,
            "field": 1
         },
         "52974ee55e272dcb3d000098": {
            "page": 0,
            "field": 2
         },
         "52974ee55e272dcb3d0000a4": {
            "page": 0,
            "field": 3
         },
         "52974ee55e272dcb3d000099": {
            "page": 0,
            "field": 4
         },
         "52974ee55e272dcb3d00009a": {
            "page": 0,
            "field": 5
         },
         "52974ee55e272dcb3d00009d": {
            "page": 0,
            "field": 6
         },
         "52974ee55e272dcb3d00009b": {
            "page": 0,
            "field": 7
         },
         "52974ee55e272dcb3d00009e": {
            "page": 0,
            "field": 8
         },
         "52974ee55e272dcb3d0000a5": {
            "page": 0,
            "field": 9
         },
         "52974ee55e272dcb3d00009f": {
            "page": 0,
            "field": 10
         },
         "52974ee55e272dcb3d0000a0": {
            "page": 0,
            "field": 11
         },
         "52974ee55e272dcb3d0000a1": {
            "page": 0,
            "field": 12
         },
         "52974ee55e272dcb3d0000a2": {
            "page": 0,
            "field": 13
         },
         "52974ee55e272dcb3d0000a3": {
            "page": 0,
            "field": 14
         },
         "52974ee55e272dcb3d0000a6": {
            "page": 0,
            "field": 15
         },
         "52974ee55e272dcb3d0000a7": {
            "page": 0,
            "field": 16
         },
         "52974ee55e272dcb3d0000a8": {
            "page": 0,
            "field": 17
         }
      },
      "appsUsingForm": 123,
      "submissionsToday": 1234,
      "submissionsTotal": 124125
};

var TEST_SUBMISSION_INCOMPLETE = {
    "_id": null,
    "_type": "submission",
    "_ludid": "527d4539639f521e0a000004_submission_1386675705725",
    "_localLastUpdate": 1386675705725,
    "formName": "testFieldsForm",
    "formId": "527d4539639f521e0a000004",
    "deviceFormTimestamp": 1385647845865,
    "status": "new",
    "createDate": "2013-12-10T11:41:45.725Z",
    "appId": "8P-SzpQTu1EqHLYrZQAdUzPQ",
    "timezoneOffset" : 120,
    "appEnvironment": "dev",
    "appCloudName": "",
    "comments": [],
    "formFields": [{
        "fieldId": "527d4539639f521e0a000006",
        "fieldValues": ["fdsafads"]
    }, {
        "fieldId": "52974ee55e272dcb3d00009a",
        "fieldValues": ["radio3 checked", "radio3 checked"]
    }, {
        "fieldId": "52974ee55e272dcb3d00009d",
        "fieldValues": [{
            "selections": ["1", "2"]
        }, {
            "selections": ["1", "2"]
        }]
    }, {
        "fieldId": "52974ee55e272dcb3d00009b",
        "fieldValues": ["dropdownVal3", "dropdownVal3"]
    }, {
        "fieldId": "52974ee55e272dcb3d0000a0",
        "fieldValues": [{
            "lat": 52.251030799999995,
            "long": -7.153408600000034,
            "zoom": 16
        }]
    }],
    "saveDate": null,
    "submitDate": null,
    "uploadStartDate": null,
    "submittedDate": null
};

module.exports.testBasicFormCheckRulesFieldSetToShowInRule = function (finish) {
  var engine = formsRulesEngine(TEST_FORMDEF_1);

      engine.checkRules(TEST_SUBMISSION_INCOMPLETE, function (err, results) {
        assert.ok(!err);
        assert.ok(results);
        assert.ok(results.actions);
        assert.ok(results.actions.fields);
        assert.equal(Object.keys(results.actions.fields).length, 3, 'Should only be 3 fields listed, since only 3 targets specified in rules');

        assert.equal(results.actions.fields['52974ee55e272dcb3d0000a6_0'].action, "hide");
        assert.equal(results.actions.fields['52974ee55e272dcb3d0000a7_0'].action, "hide");
        assert.equal(results.actions.fields['52974ee55e272dcb3d0000a8_0'].action, "hide");

        assert.ok(results.actions.pages);
        assert.equal(Object.keys(results.actions.pages).length, 1, 'Should be 1 pages listed');
        assert.equal(results.actions.pages['527d4539639f521e0a000005'].action, "hide");

        finish();
      });
};
