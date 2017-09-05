var assert = require('assert');
var proxyquire = require('proxyquire');
var _ = require('underscore');
var stream = require('stream');
var util = require('util');

//Handy writable stream to test with
function EchoStream () { // step 2
  stream.Writable.call(this);
}

util.inherits(EchoStream, stream.Writable); // step 1

EchoStream.prototype._write = function (chunk, encoding, done) { // step 3
  done();
};

module.exports = {
  setUp: function(done){
    done();
  },
  tearDown: function(done){
    done();
  },
  "Test Populate Submission File Data": function(done){

    var fileDetails = {
      groupId: "fileGroupId",
      fileName: "file.pdf",
      fileSize: 1234,
      fileType: "application/pdf",
      hashName: "filePlaceholderfile1234"
    };

    var photoDetails = {
      groupId: "photoFileGroupId",
      fileName: "photo.jpeg",
      fileSize: 412,
      fileType: "application/jpeg",
      hashName: "filePlaceholderphoto12343"
    };

    var testFormSubmittedAgainst = {
      _id: "someformid",
      pages: [
        {
          _id: "somepageid",
          fields: [{
            _id: "somefilefieldid",
            type: "file",
            values: [fileDetails]
          }, {
            _id: "somephotofieldid",
            type: "photo",
            values: [photoDetails]
          }]
        }
      ]
    };

    var testSubmission = {
      _id: "somesubmissionid",
      formId: "someformid",
      formFields: [
        {
          fieldId: "somefilefieldid",
          values: [fileDetails]
        },
        {
          fieldId: "somephotofieldid",
          values: [photoDetails]
        }
      ],
      formSubmittedAgainst: testFormSubmittedAgainst
    };

    var submissionPhotoDetails = {
      url: "file://some/local/file/path/to/photo.jpg",
      fileId: "photoFileGroupId"
    };

    var submissionFiles = [
      submissionPhotoDetails
    ];

    var _populateSubmissionFileData = require('../../../lib/impl/pdfGeneration/cacheFiles.js').populateSubmissionFileData;

    var populatedSubmission = _populateSubmissionFileData({
      form: testFormSubmittedAgainst,
      submissionFiles: submissionFiles,
      downloadUrl: "https://some.location.com",
      fileUriPath: "/api/v2/mbaas/env/appforms/submissions/:id/files/:fileId",
      submission: testSubmission
    });

    //The File Field Should Have A Download Url
    assert.equal(populatedSubmission.pages[0].fields[0].values[0].url, "https://some.location.com/api/v2/mbaas/env/appforms/submissions/somesubmissionid/files/fileGroupId");

    //The Photo Field Should Have a local file url
    assert.equal(populatedSubmission.pages[0].fields[1].values[0].url, "file://some/local/file/path/to/photo.jpg");
    done();
  },
  "Test Cache Submission File": function(done){
    var mocks = {
      '../getSubmissionFile.js': function(connections, options, params, cb){
        assert.ok(_.isObject(connections), "Expected A Connections Parameter");
        assert.ok(_.isObject(options), "Expected An Options Parameter");
        assert.equal(params._id, "somefileidtocache");
        var s = new stream.Readable();
        s._read = function noop() {};
        s.push('your text here');
        s.push(null);

        s.pause();

        return cb(undefined, {
          stream: s
        });
      }
    };

    var testWriteStream = new EchoStream();

    var _cacheSubmissionFile = proxyquire('../../../lib/impl/pdfGeneration/cacheFiles.js', mocks).cacheSubmissionFile;

    _cacheSubmissionFile({
      connections: {},
      options: {},
      fileId: "somefileidtocache"
    }, testWriteStream, function(err){
      assert.ok(!err, "Expected No Error When Writing The Stream " + err);
      done();
    });
  },
  "Test Merge Submission Files": function(done) {
    var mocks = {
      '../getSubmissionFile.js': function(connections, options, params, cb) {
        assert.ok(_.isObject(connections), "Expected A Connections Parameter");
        assert.ok(_.isObject(options), "Expected An Options Parameter");
        assert.equal(params._id, "photoFileGroupId");
        var s = new stream.Readable();
        s._read = function noop() {};
        s.push('your text here');
        s.push(null);

        s.pause();

        return cb(undefined, {
          stream: s
        });
      },
      'fs': {
        createWriteStream: function(fileUri){
          //Expecting A local file uri.
          assert.equal(fileUri, "/some/pdf/dir/to/export/to/image_binary_photoFileGroupId");
          //returning a fake write stream
          return new EchoStream();
        }
      }
    };

    var fileDetails = {
      groupId: "fileGroupId",
      fileName: "file.pdf",
      fileSize: 1234,
      fileType: "application/pdf",
      hashName: "filePlaceholderfile1234"
    };

    var photoDetails = {
      groupId: "photoFileGroupId",
      fileName: "photo.jpeg",
      fileSize: 412,
      fileType: "application/jpeg",
      hashName: "filePlaceholderphoto1234"
    };

    var testSubmission = {
      _id: "somesubmissionid",
      formId: "someformid",
      formFields: [
        {
          fieldId: {
            _id: "somefilefieldid",
            type: "file"
          },
          fieldValues: [fileDetails]
        },
        {
          fieldId: {
            _id: "somephotofieldid",
            type: "photo"
          },
          fieldValues: [photoDetails]
        }
      ],
      formSubmittedAgainst: {
        _id: "someformid",
        pages: [
          {
            _id: "somepageid",
            fields: [{
              _id: "somefilefieldid",
              type: "file",
              values: [fileDetails]
            }, {
              _id: "somephotofieldid",
              type: "photo",
              values: [photoDetails]
            }]
          }
        ]
      }
    };

    var _mergeSubmissionFiles = proxyquire('../../../lib/impl/pdfGeneration/cacheFiles.js', mocks).mergeSubmissionFiles;

    _mergeSubmissionFiles({
      submission: testSubmission,
      connections: {},
      options: {
        pdfExportDir: "/some/pdf/dir/to/export/to",
        downloadUrl: "https://some.location.com",
        fileUriPath: "/api/v2/mbaas/env/appforms/submissions/:id/files/:fileId"
      },
      fileId: "somefileidtocache"
    }, function(err, mergedSubmission) {
      assert.ok(!err, "Expected No Error When Writing The Stream");

      //The File Field Should Have A Download Url
      assert.equal(mergedSubmission.formSubmittedAgainst.pages[0].fields[0].values[0].url, "https://some.location.com/api/v2/mbaas/env/appforms/submissions/somesubmissionid/files/fileGroupId");

      //The Photo Field Should Have a local file url
      assert.equal(mergedSubmission.formSubmittedAgainst.pages[0].fields[1].values[0].url, "file:///some/pdf/dir/to/export/to/image_binary_photoFileGroupId");
      done();
    });
  }
};