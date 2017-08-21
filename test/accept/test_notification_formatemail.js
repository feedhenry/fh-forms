var assert = require('assert');

var notification = require('../../lib/impl/notification.js');

var submission = {
  _id: "52f0bb82594dd41a232dbd75",
  appCloudName: 'appCloudName123456',
  appEnvironment: 'devLive',
  appId: 'appId123456',
  deviceFormTimestamp: new Date().toString(),
  deviceIPAddress: '192.168.1.1',
  deviceId: 'device123456',
  formId: "52f0bb82594dd41a232dbd6a",
  masterFormTimestamp: new Date().toString(),
  timezoneOffset: 120,
  formSubmittedAgainst: {
    pages: [
      {
        _id: 'page',
        fields: [
          { _id: '0' },
          { _id: '1' },
          { _id: '2' },
          { _id: '3' },
          { _id: '4' },
          { _id: '5' },
          { _id: '6' },
          { _id: '7' }
        ]
      }
    ]
  },
  formFields:[
    {
      fieldId: { _id: '0', name: 'greeting', type: 'text'},
      fieldValues: [ "Hello", "World" ]
    },
    {
      fieldId: { _id: '1', name: 'TestField0', type: 'text'},
      fieldValues: [ 'TestFieldValue0' ]
    },
    {
      fieldId: { _id: '2', name: 'TestField1', type: 'file'},
      fieldValues: [ {
        "groupId": "5332b9cf887b0f0422000001",
        "fileName": "fileName1",
        "fileSize": 42,
        "fileType": "application/pdf",
        "fileUpdateTime": 1395764753258,
        "hashName": "filePlaceHolder123456"
      } ]
    },
    {
      fieldId: { _id: '3', name: 'TestField2', type: 'file'},
      fieldValues: [ {
        "groupId": "5332b9cf887b0f0422000002",
        "fileName": "fileName2",
        "fileSize": 42,
        "fileType": "image/jpeg",
        "fileUpdateTime": 1395764753258,
        "hashName": "filePlaceHolder123456"
      } ]
    },
    {
      fieldId: { _id: '4', name: 'TestField3', type: 'checkboxes'},
      fieldValues: [
        {
          selections: ['TestField3ValueSelect1', 'TestField3ValueSelect2']
        }
      ]
    },
    {
      fieldId: { _id: '5', name: 'TestField4', type: 'location', fieldOptions: {definition:{locationUnit:"latlong"}}},
      fieldValues: [ {lat: 52.1234, 'long': -7.5678} ]
    },
    {
      fieldId: { _id: '6', name: 'TestField5', type: 'location', fieldOptions: {definition:{locationUnit:"eastnorth"}}},
      fieldValues: [ {zone: 'SL', eastings: 49000, northings: 12345} ]
    },
    {
      fieldId: { _id: '7', name: 'TestField6', type: 'locationMap' },
      fieldValues: [ {lat: 52.1234, 'long': -7.5678} ]
    }
  ],
  comments:
   [ { madeBy: 'somePerson@example.com',
       madeOn: new Date().toString(),
       value: 'This is a comment' },
     { madeBy: 'somePerson@example.com',
       madeOn: new Date().toString(),
       value: 'This is another comment' } ],
  status: 'complete',
  submissionStartedTimestamp: new Date().toString(),
  updatedTimestamp: new Date().toString(),
  submissionCompletedTimestamp: new Date().toString()
};

module.exports.test = {};

module.exports.test.it_should_return_formatted_submission = function(finish) {
  var formName = "test form name";
  var subscribers = "test1@example.com, tset2@example.com";

  var msg = notification.buildSubmissionReceivedMessage(subscribers, formName, submission);

  assert.equal(msg.subscribers, subscribers);
  assert.equal(msg.formId, submission.formId);
  assert.equal(msg.appId, submission.appId);
  assert.equal(msg.formName, formName);
  assert.equal(msg.submissionStatus, submission.status);
  assert.equal(msg.appEnvironment, submission.appEnvironment);
  assert.equal(msg.deviceIPAddress, submission.deviceIPAddress);
  assert.equal(msg.deviceId, submission.deviceId);
  assert.equal(msg.submittedFields.length, 8);
  assert.equal(msg.submittedFields[0], "greeting: Hello, World");
  assert.equal(msg.submittedFields[1], "TestField0: TestFieldValue0");
  assert.equal(msg.submittedFields[2], "TestField1: --#host#--/api/v2/forms/submission/file/5332b9cf887b0f0422000001");
  assert.equal(msg.submittedFields[3], "TestField2: --#host#--/api/v2/forms/submission/file/5332b9cf887b0f0422000002");
  assert.equal(msg.submittedFields[4], "TestField3: (TestField3ValueSelect1,TestField3ValueSelect2)");
  assert.equal(msg.submittedFields[5], "TestField4: (52.1234,-7.5678)");
  assert.equal(msg.submittedFields[6], "TestField5: (SL 49000, 12345)");
  assert.equal(msg.submittedFields[7], "TestField6: (52.1234,-7.5678)");

  finish();
};
