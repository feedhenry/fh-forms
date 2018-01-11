
var assert = require('assert');
var notification = require('../../../lib/impl/notification.js');


describe("Building Submission Email Data", function() {
  var mockSubmission = require('../../Fixtures/notificationsSubmission.json');


  it("It should get a submission and build the email data.", function(done) {
    var formName = "test form name";
    var subscribers = "test1@example.com, tset2@example.com";

    var msg = notification.buildSubmissionReceivedMessage(subscribers, formName, mockSubmission);

    assert.equal(msg.subscribers, subscribers);
    assert.equal(msg.formId, mockSubmission.formId);
    assert.equal(msg.appId, mockSubmission.appId);
    assert.equal(msg.formName, formName);
    assert.equal(msg.submissionStatus, mockSubmission.status);
    assert.equal(msg.appEnvironment, mockSubmission.appEnvironment);
    assert.equal(msg.deviceIPAddress, mockSubmission.deviceIPAddress);
    assert.equal(msg.deviceId, mockSubmission.deviceId);
    assert.equal(msg.submittedFields.length, 6);

    assert.equal(msg.submittedFields[0], "page select: (1)");
    assert.equal(msg.submittedFields[1], "Untitled: test message");
    assert.equal(msg.submittedFields[2], "Untitled: ");
    assert.equal(msg.submittedFields[3], "Untitled: ");
    assert.equal(msg.submittedFields[4], "Untitled: ");
    assert.equal(msg.submittedFields[5], "Untitled: ");
    done();
  });
});