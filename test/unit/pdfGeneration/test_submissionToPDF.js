var _ = require('underscore');
var async = require('async');
var sinon = require('sinon');
var assert = require('assert');
var proxyquire = require('proxyquire');


describe("Testing Submission PDF Generation Queue", function() {

  before(function(done){
    this.timeoutMS = 200;
    this.renderPDFPath = '../../../lib/impl/pdfGeneration/renderPDF';
    this.mockLocation = "http://some.location.com";
    done();
  });

  it("It should only execute a maximum of 1 concurrent PDF Generation", function(done) {
    var firstCalledTime, secondCalledTime;
    var self = this;

    var mockSubmission = {
      _id: "somesubmisisonid",
      formSubmittedAgainst: {
        _id: "someformid"
      }
    };

    var mocks = {
      './doPdfGeneration': function(params, cb) {

        //If the first pdf generation has been called, then the second should have been called at least after `timeoutMS` as that's when the first generation has completed.
        if (firstCalledTime) {
          secondCalledTime = Date.now();
          
          assert(secondCalledTime - firstCalledTime >= self.timeoutMS, secondCalledTime + " - " + firstCalledTime + " >= " + self.timeoutMS);
        } else {
          firstCalledTime = Date.now();
        }

        setTimeout(cb, self.timeoutMS);
      }
    };

    var submissionToPDF = proxyquire(this.renderPDFPath, mocks).submissionToPDF;

    async.parallel([
      function firstCall(cb) {
        submissionToPDF({
          submission: mockSubmission,
          options: {
            location: self.mockLocation
          },
          maxConcurrentPhantomPerWorker: 1
        }, function(err) {
          assert.ok(!err, "Expected No Error " + err);
          cb();
        });
      },
      function secondCall(cb) {
        submissionToPDF({
          submission: mockSubmission,
          options: {
            location: self.mockLocation
          },
          maxConcurrentPhantomPerWorker: 1
        },  function(err) {
          assert.ok(!err, "Expected No Error");
          cb();
        });
      }
    ], done);

  });

  it("Executing 2 concurrent PDF Generations at the same time.", function(done) {
    var firstCalledTime, secondCalledTime;
    var self = this;

    var mockSubmission = {
      _id: "somesubmisisonid",
      formSubmittedAgainst: {
        _id: "someformid"
      }
    };

    var mocks = {
      './doPdfGeneration': function(params, cb) {
        if (firstCalledTime) {
          secondCalledTime = Date.now();

          //In the case where the concurrency is 2, then the parallel executions should execute at the same time.
          assert(secondCalledTime - firstCalledTime < 2);
        } else {
          firstCalledTime = Date.now();
        }

        setTimeout(cb, self.timeoutMS);
      }
    };

    var submissionToPDF = proxyquire(this.renderPDFPath, mocks).submissionToPDF;

    async.parallel([
      function firstCall(cb) {
        submissionToPDF({
          submission: mockSubmission,
          options: {
            location: self.mockLocation
          },
          maxConcurrentPhantomPerWorker: 2
        }, function(err) {
          assert.ok(!err, "Expected No Error " + err);
          cb();
        });
      },
      function secondCall(cb) {
        submissionToPDF({
          submission: mockSubmission,
          options: {
            location: self.mockLocation
          },
          maxConcurrentPhantomPerWorker: 2
        },  function(err) {
          assert.ok(!err, "Expected No Error");
          cb();
        });
      }
    ], done);

  });

});