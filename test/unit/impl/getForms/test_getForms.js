var proxyquire = require('proxyquire');
var assert = require('assert');
var sinon = require('sinon');
var constants = require("../../../../lib/common/constants");
var MODEL_NAMES = constants.MODELNAMES;
require('sinon-as-promised');

// Mocks
var appForms = [{
  _id: "dummyFormIdA",
  name: "dummy Form A",
  lastUpdated: new Date(),
  updatedBy: "dummy",
  createdBy: "dummy",
  createdOn: new Date(),
  dataSources: {}
}, {
  _id: "dummyFormIdB",
  name: "dummy Form B",
  lastUpdated: new Date(),
  updatedBy: "dummy",
  createdBy: "dummy",
  createdOn: new Date(),
  dataSources: {}
}];

var options = {
  appId: "dummyAppId",
  getAllForms: true
};

var mockFormModel = {
  find: function () {
    return {
      exec: sinon.stub().callsArgWith(0, null, appForms)
    }
  }
};

var mockFormsCountModel = {
  count: function (query) {
    // Simulate the count function so that on two iterations two different forms
    // are expected. Return different results depending on the form.
    var count = 0;
    if (query.forms === appForms[0]._id || query.formId === appForms[0]._id) {
      count = 1;
    } else if (query.forms === appForms[1]._id || query.formId === appForms[1]._id) {
      count = 2;
    }

    return {
      exec: sinon.stub().callsArgWith(0, null, count)
    }
  }
};

var connections = {
  mongooseConnection: null,
  databaseConnection: {
    collection: function () {
      return {
        mapReduce: sinon.stub().resolves(4096)
      };
    }
  }
};

var getForms = proxyquire('../../../../lib/impl/getForms', {
  '../common/models.js': function () {
    return {
      get: function (conn, model) {
        switch(model) {
          case MODEL_NAMES.FORM: return mockFormModel;
          case MODEL_NAMES.FORM_SUBMISSION: return mockFormsCountModel;
          case MODEL_NAMES.APP_FORMS: return mockFormsCountModel;
          default: throw new Exception("Unknown model");
        }
      },
      MODELNAMES: MODEL_NAMES
    }
  },
  './appforms.js': {
    getAppFormsWithPopulatedForms: sinon.stub().callsArgWith(3, null, appForms)
  },
  './groups.js': {
    getFormsForUser: sinon.stub().callsArgWith(2, null, appForms)
  }
});

describe('Form statistics', function() {
  it('should compute the correct statistics based on the form usage', function(done) {
    getForms().getForms(connections, options, function (err, result) {
      assert.ok(!err, err);
      assert.ok(result, "No result returned");
      assert.equal(result.length, 2, "Must return exactly two forms");
      assert.equal(result[0]._id, "dummyFormIdA", "Form _id field not correct");
      assert.equal(result[1]._id, "dummyFormIdB", "Form _id field not correct");

      // Require the two forms to report different usages
      assert.equal(result[0].appsUsingForm, 1, "Unexpected statistics result");
      assert.equal(result[1].appsUsingForm, 2, "Unexpected statistics result");
      assert.equal(result[0].submissionsTotal, 1, "Unexpected statistics result");
      assert.equal(result[1].submissionsTotal, 2, "Unexpected statistics result");
      assert.equal(result[0].submissionsToday, 1, "Unexpected statistics result");
      assert.equal(result[1].submissionsToday, 2, "Unexpected statistics result");
      done();
    });
  });
});
