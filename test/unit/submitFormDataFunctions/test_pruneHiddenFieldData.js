var getBaseSubmission = require('../../Fixtures/baseSubmission');
var pruneHiddenFieldData = require('../../../lib/impl/submitFormDataFunctions/pruneHiddenFieldData');
var ObjectId = require('mongoose').Types.ObjectId;
var assert = require('assert');

describe("Submissions values should have empty hidden fields", function() {

  var testHidingFieldsForm = {
    "_id":"582dbc9009ce8d9c6e63f532",
    "name":"hiddenvalue",
    "lastUpdatedTimestamp":1479392898397,
    "pageRules":[
      {
        "type":"skip",
        "_id":"582dbe8209ce8d9c6e63f538",
        "targetPage":[
          "582dbce709ce8d9c6e63f535"
        ],
        "ruleConditionalStatements":[
          {
            "sourceField":"582dbce709ce8d9c6e63f533",
            "restriction":"is",
            "sourceValue":"hidepage",
            "_id":"582dbe8209ce8d9c6e63f539"
          }
        ],
        "ruleConditionalOperator":"and",
        "relationType":"and"
      }
    ],
    "fieldRules":[
      {
        "type":"hide",
        "_id":"582dbda67ae62c9b6e4afedc",
        "targetField":[
          "582dbce709ce8d9c6e63f534"
        ],
        "ruleConditionalStatements":[
          {
            "sourceField":"582dbce709ce8d9c6e63f533",
            "restriction":"is",
            "sourceValue":"hidenumber",
            "_id":"582dbda67ae62c9b6e4afedd"
          }
        ],
        "ruleConditionalOperator":"and",
        "relationType":"and"
      },
      {
        "type":"hide",
        "_id":"582dbda67ae62c9b6e4afede",
        "targetField":[
          "582dbce709ce8d9c6e63f537"
        ],
        "ruleConditionalStatements":[
          {
            "sourceField":"582dbce709ce8d9c6e63f533",
            "restriction":"is",
            "sourceValue":"hidefile",
            "_id":"582dbda67ae62c9b6e4afedf"
          }
        ],
        "ruleConditionalOperator":"and",
        "relationType":"and"
      }
    ],
    "pages":[
      {
        "_id":"582dbc9009ce8d9c6e63f531",
        "name":"Page 1",
        "fields":[
          {
            "required":true,
            "type":"text",
            "name":"Text",
            "_id":"582dbce709ce8d9c6e63f533"
          },
          {
            "required":true,
            "type":"number",
            "name":"Number",
            "_id":"582dbce709ce8d9c6e63f534"
          }
        ]
      },
      {
        "name":"Page 2",
        "_id":"582dbce709ce8d9c6e63f535",
        "fields":[
          {
            "required":true,
            "type":"text",
            "name":"Text 2",
            "_id":"582dbce709ce8d9c6e63f536",
            "adminOnly":false,
            "fieldOptions":{
              "validation":{
                "validateImmediately":true
              }
            }
          },
          {
            "required":true,
            "type":"file",
            "name":"File",
            "_id":"582dbce709ce8d9c6e63f537",
            "adminOnly":false,
            "fieldOptions":{
              "validation":{
                "validateImmediately":true
              }
            }
          }
        ]
      }
    ]
  };


  describe("Hiding a field should have empty value", function() {
    var textFieldId = "582dbce709ce8d9c6e63f533";
    var numberFieldId = "582dbce709ce8d9c6e63f534";
    /**
     * Checking the pruned results for removed fields.
     * Checking that field data that is empty.
     *
     * @param err
     * @param prunedSubmission
     */
    function checkResults(err, prunedSubmission) {
      assert.ok(!err, "Expected no error when pruning hidden fields", err);
      var formFields = prunedSubmission.formFields;
      assert.equal(2, formFields.length, "Expected only 2 entries");
      assert.equal(textFieldId, formFields[0].fieldId, "Expected text field ID");
      assert.equal(numberFieldId, formFields[1].fieldId, "Expected number field ID");
      assert.equal("hidenumber", formFields[0].fieldValues[0], "Expected a value in the text field not hidden");
      assert.equal(undefined, formFields[1].fieldValues[0],"Expected empty value for the hidden field");
    }

    /**
     * Small utility function to generate test data.
     *
     * The field is either a string or a field model. The pruning logic should handle both.
     *
     * @param isFieldModel - flag to generate data that has the fieldId as a field model with mongoose objectId or just a string.
     *
     * @returns {{appId, appCloudName, appEnvironment, appClientId, timezoneOffset, userId, deviceId, deviceIPAddress, deviceFormTimestamp, comments}|*}
     */
    function getTestSubmission(isFieldModel) {
      var submission = getBaseSubmission();

      var fieldIdEntryText = isFieldModel ? {
        _id: new ObjectId(textFieldId),
        type: "text"
      } : textFieldId;

      var numberFieldId = "582dbce709ce8d9c6e63f534";
      var fieldIdEntryNumber = isFieldModel ? {
        _id: new ObjectId(numberFieldId),
        type: "text"
      } : numberFieldId;

      submission.formFields = [
        //Setting the text field that rules are based on to hide the number field
        {
          fieldId: fieldIdEntryText,
          fieldValues: ["hidenumber"]
        },
        {
          fieldId: fieldIdEntryNumber,
          fieldValues: [22]
        }];
      return submission;
    }

    it("Field ID Is A Field Model", function(done) {
      var submission = getTestSubmission(true);

      pruneHiddenFieldData(testHidingFieldsForm, submission, function(err, prunedSubmission) {
        checkResults(err, prunedSubmission);
        done();
      });
    });

    it("Field ID Is A String", function(done) {
      var submission = getTestSubmission(false);

      pruneHiddenFieldData(testHidingFieldsForm, submission, function(err, prunedSubmission) {
        checkResults(err, prunedSubmission);
        done();
      });
    });


  });

  it("Hiding a Page should have empty values in all fields in that page", function(done) {

    var submission = getBaseSubmission();

    submission.formFields = [
      //Setting the text field that rules are based on to hide the number field
      {
        fieldId: "582dbce709ce8d9c6e63f533",
        fieldValues: ["hidepage"]
      },
      {
        fieldId: "582dbce709ce8d9c6e63f536",
        fieldValues: ["sometext"]
      },
      {
        fieldId: "582dbce709ce8d9c6e63f537",
        fieldValues: [{
          "fileName": "test",
          "fileSize": 123456,
          "fileType": "application/pdf",
          "fileUpdateTime": new Date().getTime(),
          "hashName": "filePlaceHolder123456"
        }]
      }];

    pruneHiddenFieldData(testHidingFieldsForm, submission, function(err, prunedSubmission) {
      assert.ok(!err, "Expected no error when pruning hidden fields", err);
      var formFields = prunedSubmission.formFields;
      var hidePageFieldId = "582dbce709ce8d9c6e63f533";
      var hiddenFieldId1 = "582dbce709ce8d9c6e63f536";
      var hiddenFieldId2 = "582dbce709ce8d9c6e63f537";
      assert.equal(3, formFields.length, "Expected only 3 entries");
      assert.equal(hidePageFieldId, formFields[0].fieldId, "Expected hide page field ID");
      assert.equal(hiddenFieldId1, formFields[1].fieldId, "Expected hidden field ID");
      assert.equal(hiddenFieldId2, formFields[2].fieldId, "Expected hidden field ID");
      assert.equal("hidepage", formFields[0].fieldValues[0], "Expected a value in the text field not hidden");
      assert.equal(undefined, formFields[1].fieldValues[0],"Expected empty value for the hidden field");
      assert.equal(undefined, formFields[2].fieldValues[0],"Expected empty value for the hidden field");
      done();
    });
  });

});