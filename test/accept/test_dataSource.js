require('./../Fixtures/env.js');
var mongoose = require('mongoose');
var async = require('async');
var util = require('util');
var models = require('../../lib/common/models.js')();
var forms = require('../../lib/forms.js');
var initDatabase = require('./../setup.js').initDatabase;
var misc = require('../../lib/common/misc.js');
var _ = require('underscore');
var dataSourceData = require('../Fixtures/dataSource.js');
var logger = require('../../lib/common/logger').getLogger();
var simpleForm = require('../Fixtures/simple.js');
var handyFieldData = require('../Fixtures/formSubmissions.js');

var DataSource;
var connection;

var ERROR_CODES = models.CONSTANTS.ERROR_CODES;

var assert = require('assert');
var options = {'uri': process.env.FH_DOMAIN_DB_CONN_URL, userEmail: "testUser@example.com"};

var dataOptions = {
  option1: function(selected){
    return  {
      key: "op1",
      value: "Option 1",
      selected: selected
    };
  },
  option2: function(selected){
    return  {
      key: "op2",
      value: "Option 2",
      selected: selected
    };
  },
  option3: function(selected){
    return  {
      key: "op3",
      value: "Option 3",
      selected: selected
    };
  },
  //This should be valid, key is not required
  optionNoKey: function() {
    return {
      value: "Value No Key",
      selected: true
    };
  },
  //This should be valid, selected is not required
  optionNoSelected: function() {
    return {
      key: "keynoselected",
      value: "Value No Selected"
    };
  },
  //This should be valid, key and selected is not required
  optionValueOnly: function() {
    return {
      value: "Value Only"
    };
  }
};


/**
 * verifyBackoffIncrement - Verifying the cache backoff index is as expected
 *
 * @param  {string} dataSourceId         ID of the data source to check.
 * @param  {number} expectedBackoffIndex Expected backOffIndex Value
 * @param  {function} cb
 */
function verifyBackoffIncrement(dataSourceId, expectedBackoffIndex, cb){
  DataSource.findOne({_id: dataSourceId}, function(err, dataSource){
    assert.ok(!err, "Epected No Error");
    assert.ok(dataSource, "Expected A Data Source");

    assert.equal(expectedBackoffIndex, dataSource.cache[0].backOffIndex);
    cb();
  });
}

function verifyDataSourceJSON(expected, actual){
  assert.ok(expected, "verifyDataSourceJSON: expected object required");
  assert.ok(actual, "verifyDataSourceJSON: actual object required");

  logger.debug("verifyDataSourceJSON", {
    expected: expected,
    actual: actual
  });

  assert.ok(_.isEqual(expected, _.omit(actual, "lastUpdated", "dateCreated", "backOffIndex")), "Expected objects to be equal. Expected: " + util.inspect(expected) + " Actual: " + util.inspect(_.omit(actual, "lastUpdated", "dateCreated")));
}

function verifyDataSourceAuditLogEntry(dsAuditLogEntry, expectedServiceGuid, expectedEndpoint){
  assert.ok(dsAuditLogEntry.updateTimestamp, "Expected an updateTimestamp Property");
  assert.ok(dsAuditLogEntry.lastRefreshed, "Expected a lastRefreshed Property");
  assert.ok(dsAuditLogEntry.dataHash, "Expected a dataHash Property");
  assert.equal(expectedServiceGuid, dsAuditLogEntry.serviceGuid);
  assert.equal(expectedEndpoint, dsAuditLogEntry.endpoint);
}

function verifyDataSourceResponse(expectedDataSource, expectedDataSourceData, expectedHash, expectedError, actualResponse, updateTimestamp){
  //The response should return the contents of the cache.
  var testResponse = _.clone(actualResponse);
  assert.ok(testResponse.lastRefreshed, "Expected A Last Refreshed Field To Be Set");

  delete testResponse.lastRefreshed;

  var status = expectedError ? {
    status: "error",
    error: expectedError
  } : {
    status: "ok"
  };

  //Should have data source data
  var expectedResponse = expectedDataSource;

  _.extend(expectedResponse, {
    dataHash: expectedHash,
    updateTimestamp: updateTimestamp,
    currentStatus: status,
    data: expectedDataSourceData
  });

  //Base Data Source Information Should Be Returned
  verifyDataSourceJSON(expectedResponse, testResponse);
}

module.exports.test = {
  "before": function(done){
    logger.debug("before");
    initDatabase(assert, function(err) {
      assert.ok(!err, "Unexpected Error " + util.inspect(err));
      connection = mongoose.createConnection(options.uri);
      models.init(connection);

      DataSource = models.get(connection, models.MODELNAMES.DATA_SOURCE);
      done();
    });
  },
  "after": function(done){
    //Remove Any Existing Data Sources

    logger.debug("after");

    DataSource.remove({}, function(err){
      assert.ok(!err, "Unexpected Error " + util.inspect(err));
      connection.close(function(err) {
        assert.ok(!err);
        forms.tearDownConnection(options, function (err) {
          assert.ok(!err);
          done();
        });
      });
    });
  },
  "Test Create New Data Source": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSCreate";

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

      //Data Source Was Created, verify responses
      assert.ok(createdDataSource, "Expected The Data Source To Be Returned");
      assert.ok(createdDataSource._id, "Expected The Data Source ID To Be Returned");
      assert.ok(createdDataSource.lastUpdated, "Expected A Last Updated Field");
      assert.ok(createdDataSource.dateCreated, "Expected A Date Created Field");
      assert.ok(createdDataSource.createdBy, "Expected A Created By Field");
      assert.equal(createdDataSource.createdBy, testDataSource.createdBy);
      assert.ok(createdDataSource.updatedBy, "Expected A Updated By Field");
      assert.equal(createdDataSource.updatedBy, testDataSource.updatedBy);

      testDataSource._id = createdDataSource._id;

      verifyDataSourceJSON(testDataSource, createdDataSource);

      done();
    });
  },
  "Test Create New Data Source Duplicate Name": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSCreateDuplicate";

    forms.dataSources.create(options, testDataSource, function(err){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

      //Trying to create it again with the same name should return an error
      forms.dataSources.create(options, testDataSource, function(err){
        assert.ok(err, "Expected An Error");

        assert.ok(err.systemDetail.indexOf(testDataSource.name) > -1);
        assert.ok(err.systemDetail.indexOf("Already Exists") > -1);
        assert.ok(err.code, ERROR_CODES.FH_FORMS_INVALID_PARAMETERS);

        done();
      });
    });
  },
  "Test Create New Service Data Source No Service Guid": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSCreateNoServiceGuid";

    delete testDataSource.serviceGuid;

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(err, "Expected An Error When Creating A Service Data Source With No Service Guid");
      assert.ok(err.userDetail.indexOf("Invalid Data Source Creation Data") > -1, "Unexpected Error Message: " + util.inspect(err));
      assert.ok(err.code === ERROR_CODES.FH_FORMS_INVALID_PARAMETERS, "Expected An FH_FORMS_INVALID_PARAMETERS Error Code");
      assert.ok(!createdDataSource, "Exepected No Data Source To Have Been Created");

      done();
    });
  },
  "Test Remove Data Source": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSRemove";

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));
      assert.ok(createdDataSource._id, "Expected A Data Source Id");

      var removalParams = {
        _id: createdDataSource._id
      };

      forms.dataSources.remove(options, removalParams, function(err){
        assert.ok(!err, "Unexpected Error: dataSource.remove" + util.inspect(err));

        forms.dataSources.get(options, removalParams, function(err, foundDataSource){
          assert.ok(err, "Expected An Error When Getting Data Source That Should Not Exist");
          assert.ok(err.userDetail.indexOf("Data Source Not Found") > -1);
          assert.ok(err.code === ERROR_CODES.FH_FORMS_NOT_FOUND, "Expected A HTTP FH_FORMS_NOT_FOUND Error Code");
          assert.ok(!foundDataSource, "Expected No Data Source When Creating A Data Source With Bad Data");
          //Removing A Non Existing Data Source Should Not Cause An Error
          forms.dataSources.remove(options, removalParams, function(err){
            assert.ok(!err, "Unexpected Error When Removing A Non Existing Data Source " + util.inspect(err));
            done();
          });
        });
      });
    });
  },
  "Test Remove Data Source Associated With Form ": function(done){
    //Removing A Data Source Associated With A Form Should Not Be Possible
    var dsId;
    var testForm = simpleForm.getBaseForm();
    var dsCreatedForm;

    async.series([
      function createDataSource(cb){
        var testDataSource = _.clone(dataSourceData);
        testDataSource.name = "testDSRemoveWithForm";

        forms.dataSources.create(options, testDataSource, function(err, createdDataSource) {
          assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));
          assert.ok(createdDataSource._id, "Expected A Data Source Id");

          dsId = createdDataSource._id;

          cb();
        });
      },
      function createForm(cb){

        //Add A Dropdown Field
        var dropdownField = _.clone(handyFieldData.dropdownFieldData);

        dropdownField.dataSource = dsId;
        dropdownField.dataSourceType = "dataSource";

        var page = {
          fields: [dropdownField]
        };

        testForm.pages = [page];

        forms.updateForm(options, testForm, function(err, createdForm){
          assert.ok(!err, "Expected No Error When Creating A New Form " + util.inspect(err));
          assert.equal(1, createdForm.pages[0].fields.length);
          assert.equal("dataSource", createdForm.pages[0].fields[0].dataSourceType);

          assert.equal(dsId.toString(), createdForm.pages[0].fields[0].dataSource.toString());

          dsCreatedForm = createdForm;

          return cb();
        });
      },
      function removeDataSource(cb){
        forms.dataSources.remove(options, {
          _id: dsId
        }, function(err) {
          assert.ok(err, "Expected An Error");

          assert.ok(err.userDetail.indexOf("Forms Are Associated With This Data Source") > -1, "Expected A Data Source Form Error Message");
          cb();
        });
      },
      function updateFormToRemoveAssociation(cb){
        dsCreatedForm.pages[0].fields[0].dataSourceType = "static";

        forms.updateForm(options, dsCreatedForm, function(err, updatedForm) {
          assert.ok(!err, "Expected No Error When Creating A New Form " + util.inspect(err));
          assert.equal(1, updatedForm.pages[0].fields.length);
          assert.equal("static", updatedForm.pages[0].fields[0].dataSourceType);
          cb();
        });
      },
      function removeDataSourceAgain(cb){
        forms.dataSources.remove(options, {
          _id: dsId
        }, function(err) {
          assert.ok(!err, "Expected No Error " + util.inspect(err));

          cb();
        });
      }
    ], done);
  },
  "Test Create New Service Data Source Already Exists": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSIncludingID";

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

      //Should Not Be Able To Create It Again
      forms.dataSources.create(options, createdDataSource, function(err){
        assert.ok(err, "Expected An Error When Creating A Data Source That Already Exists");
        assert.ok(err.userDetail.indexOf("Data Source ID Should Not Be Included When Creating A Data Source") > -1, "Unexpected Error Message: " + util.inspect(err));
        assert.ok(err.code === ERROR_CODES.FH_FORMS_INVALID_PARAMETERS, "Expected A HTTP FH_FORMS_INVALID_PARAMETERS Error Code");
        done();
      });
    });
  },
  "Test Update Existing Service Data Source": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSUodate";

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

      testDataSource._id = createdDataSource._id;

      verifyDataSourceJSON(testDataSource, createdDataSource);

      testDataSource.description = "Updated Data Source Description";

      forms.dataSources.update(options, testDataSource, function(err, updatedDataSource){
        assert.ok(!err, "Unexpected Error: dataSource.update" + util.inspect(err));

        //Update requires a forms field to show which forms are referenced by the dataSource
        testDataSource.forms = [];

        verifyDataSourceJSON(testDataSource, updatedDataSource);

        done();
      });
    });
  },
  "Test Update Existing Service Data Source No Service GUID": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSUodateNoService";

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

      testDataSource._id = createdDataSource._id;
      verifyDataSourceJSON(testDataSource, createdDataSource);

      var updateDataSource = _.clone(testDataSource);

      delete updateDataSource.serviceGuid;
      updateDataSource.endpoint = "/new/uri/to/data";

      forms.dataSources.update(options, updateDataSource, function(err, updatedDataSource){
        assert.ok(!err, "Unexpected Error: dataSource.update" + util.inspect(err));

        assert.ok(updatedDataSource, "Expected The Data Source To Be Returned");
        assert.ok(updatedDataSource._id, "Expected The Data Source ID To Be Returned");

        var expectedResult = _.clone(testDataSource);
        expectedResult.endpoint = "/new/uri/to/data";
        expectedResult.forms = [];

        verifyDataSourceJSON(expectedResult, updatedDataSource);

        done();
      });
    });
  },
  "Test Update Data Source Data Set Single Choice": function(done){
    //First, create a data source
    var testDataSource1 = _.clone(dataSourceData);

    testDataSource1.name = "testDS1UodateData";

    var testDataSource2 = _.clone(dataSourceData);
    testDataSource2.name = "testDS2UodateData";

    var dataSourceSingleChoiceRefreshTimestamp;

    async.series([
      function createDataSource1(cb){
        forms.dataSources.create(options, testDataSource1, function(err, createdDataSource1){
          assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

          assert.ok(createdDataSource1._id, "Expected A Data Source ID");

          testDataSource1._id = createdDataSource1._id;

          cb();
        });
      },
      function createDataSource2(cb){
        forms.dataSources.create(options, testDataSource2, function(err, createdDataSource2){
          assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

          assert.ok(createdDataSource2._id, "Expected A Data Source ID");

          testDataSource2._id = createdDataSource2._id;

          cb();
        });
      },
      function updateDataSources(cb){
        //Updating A Single Data Source Data Set
        var dataSourceDataSingleChoice = {
          data: [
            dataOptions.option1(false),
            dataOptions.option2(true)
          ]
        };
        dataSourceDataSingleChoice._id = testDataSource1._id;
        var expectedHashSingle = misc.generateHash(dataSourceDataSingleChoice.data);


        //Fields with no key/selected values are also valid
        var dataSourceDataMultiChoice = {
          data: [
            dataOptions.option1(false),
            dataOptions.option2(true),
            dataOptions.option3(true),
            dataOptions.optionNoKey(),
            dataOptions.optionNoSelected(),
            dataOptions.optionValueOnly()
          ]
        };
        var expectedHashMulti = misc.generateHash(dataSourceDataMultiChoice.data);

        dataSourceDataMultiChoice._id = testDataSource2._id;

        var currentTime = new Date();

        //Now Updating A Single Data Source
        forms.dataSources.updateCache(options, [dataSourceDataSingleChoice, dataSourceDataMultiChoice], {
          currentTime: currentTime
        }, function(err, updateResult){
          assert.ok(!err, "Unexpected Error When Updating Data Source Data " + util.inspect(err));

          //Should Only Be 2 Successfully Updated Data Sources
          assert(updateResult.validDataSourceUpdates.length === 2, "Expected Two Updated Data Source To Be Returned");
          assert(updateResult.invalidDataSourceUpdates.length === 0, "Expected No Failed Data Source Updates");

          var dataSourceUpdateResponseSingle = updateResult.validDataSourceUpdates[0];
          var dataSourceUpdateResponseMulti = updateResult.validDataSourceUpdates[1];

          verifyDataSourceResponse(testDataSource1, dataSourceDataSingleChoice.data, expectedHashSingle, undefined, dataSourceUpdateResponseSingle, currentTime);

          verifyDataSourceResponse(testDataSource2, dataSourceDataMultiChoice.data, expectedHashMulti, undefined, dataSourceUpdateResponseMulti, currentTime);

          //Noting The Last Refreshed Timestamp
          dataSourceSingleChoiceRefreshTimestamp = dataSourceUpdateResponseSingle.lastRefreshed;

          cb();
        });
      },
      function checkDSCacheAuditLog(cb){
        forms.dataSources.get(options, {
          _id: testDataSource1._id,
          includeAuditLog: true,
          includeAuditLogData: true
        }, function(err, dsIncludingAuditLog){
          assert.ok(!err);

          logger.debug("dataSourceUpdateResponseSingle ", dsIncludingAuditLog);

          var dsUpdateSingleAuditLog = dsIncludingAuditLog.auditLogs;
          assert.equal(1, dsUpdateSingleAuditLog.length);
          var dsUpdateSingleAuditLogEntry = dsUpdateSingleAuditLog[0];

          verifyDataSourceAuditLogEntry(dsUpdateSingleAuditLogEntry, testDataSource1.serviceGuid, testDataSource1.endpoint);

          //The first update audit log should contain the data set saved.
          assert.equal(dataOptions.option1().key, dsUpdateSingleAuditLogEntry.data[0].key);
          assert.equal("ok", dsUpdateSingleAuditLogEntry.currentStatus.status, "Expected A status to be set");
          return cb();
        });
      },
      function checkDSCacheAuditLogNoData(cb){
        forms.dataSources.get(options, {
          _id: testDataSource1._id,
          includeAuditLog: true
        }, function(err, dsNoAuditLog){
          assert.ok(!err);

          var dsUpdateSingleAuditLog = dsNoAuditLog.auditLogs;
          assert.equal(1, dsUpdateSingleAuditLog.length);
          var dsUpdateSingleAuditLogEntry = dsUpdateSingleAuditLog[0];

          verifyDataSourceAuditLogEntry(dsUpdateSingleAuditLogEntry, testDataSource1.serviceGuid, testDataSource1.endpoint);

          //The audit log entry should have no data.
          assert.equal(undefined, dsUpdateSingleAuditLogEntry.data);
          assert.equal("ok", dsUpdateSingleAuditLogEntry.currentStatus.status, "Expected A status to be set");
          return cb();
        });
      },
      function(cb){
        //Updating A Single Data Source With Different Data should change the response.
        var updatedSingleChoiceData = {
          data: [
            dataOptions.option2(true),
            dataOptions.option1(false)
          ]
        };
        updatedSingleChoiceData._id = testDataSource1._id;
        var expectedHashUpdated = misc.generateHash(updatedSingleChoiceData.data);

        var currentTime = new Date();
        forms.dataSources.updateCache(options, [updatedSingleChoiceData], {
          currentTime: currentTime
        }, function(err, updateResult){
          assert.ok(!err, "Unexpected Error When Updating Data Source Data");

          //Should Only Be 1 Successfully Updated Data Sources
          assert(updateResult.validDataSourceUpdates.length === 1, "Expected Two Updated Data Source To Be Returned");
          assert(updateResult.invalidDataSourceUpdates.length === 0, "Expected No Failed Data Source Updates");

          var dataSourceUpdateResponseSingle = updateResult.validDataSourceUpdates[0];
          verifyDataSourceResponse(testDataSource1, updatedSingleChoiceData.data, expectedHashUpdated, undefined, dataSourceUpdateResponseSingle, currentTime);


          var beforeRefreshedTimestamp = new Date(dataSourceSingleChoiceRefreshTimestamp).getTime();
          var afterRefreshedTimestamp = new Date(dataSourceUpdateResponseSingle.lastRefreshed).getTime();

          //The lastRefreshed Field Should Have Been Updated
          assert.ok(afterRefreshedTimestamp > beforeRefreshedTimestamp, "Expected The Timestamp After Updating A Data Source To Have Changed");

          cb();
        });
      },
      function checkDSCacheAuditLog(cb){
        forms.dataSources.get(options, {
          _id: testDataSource1._id,
          includeAuditLog: true,
          includeAuditLogData: true
        }, function(err, dsIncludingAuditLog){
          assert.ok(!err);

          logger.debug("dataSourceUpdateResponseSingle ", dsIncludingAuditLog);

          var dsUpdateSingleAuditLog = dsIncludingAuditLog.auditLogs;
          //Should now be 2 audit log entries
          assert.equal(2, dsUpdateSingleAuditLog.length);
          var dsUpdateSingleAuditLogEntry = dsUpdateSingleAuditLog[1];

          verifyDataSourceAuditLogEntry(dsUpdateSingleAuditLogEntry, testDataSource1.serviceGuid, testDataSource1.endpoint);

          //The first update audit log should contain the data set saved.
          assert.equal(dataOptions.option2().key, dsUpdateSingleAuditLogEntry.data[0].key);
          assert.equal("ok", dsUpdateSingleAuditLogEntry.currentStatus.status, "Expected A status to be set");
          return cb();
        });
      }
    ], done);
  },
  "Test List Data Sources Requiring Update": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSListForUpdate";
    var dataSourceDataSet = {
      data: [
        dataOptions.option1(false),
        dataOptions.option2(true)
      ]
    };

    var dsId;

    async.series([
      function(cb){
        DataSource.remove({}, function(err) {
          assert.ok(!err, "Unexpected Error " + util.inspect(err));
          cb();
        });
      },
      function createDataSource(cb){
        forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
          assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

          //Data Source Was Created, verify responses
          assert.ok(createdDataSource, "Expected The Data Source To Be Returned");
          assert.ok(createdDataSource._id, "Expected The Data Source ID To Be Returned");

          dsId = createdDataSource._id;
          dataSourceDataSet._id = dsId;
          cb();
        });
      },
      function(cb){
        //Should Be A Single Data Source Requiring An Update
        forms.dataSources.list(options, {
          listDataSourcesNeedingUpdate: true,
          currentTime: new Date()
        }, function(err, dataSources){
          assert.ok(!err, "Expected No Error " + util.inspect(err));

          assert.equal(1, dataSources.length);
          cb();
        });
      },
      function(cb){
        //Update The Cache
        forms.dataSources.updateCache(options, [dataSourceDataSet], {
            currentTime: new Date()
          }, function(err){
          assert.ok(!err, "Expected No Error");
          cb();
        });
      },
      function(cb){
        //Should Be No Data Sources Needing An Update Now.
        forms.dataSources.list(options, {
          listDataSourcesNeedingUpdate: true,
          currentTime: new Date()
        }, function(err, dataSources){
          assert.ok(!err, "Expected No Error " + util.inspect(err));

          assert.equal(0, dataSources.length);
          cb();
        });
      },
      function(cb){
        //After the refresh interval, the data source should be returned
        forms.dataSources.list(options, {
          listDataSourcesNeedingUpdate: true,
          currentTime: new Date(new Date().valueOf() + new Date(testDataSource.refreshInterval * 60 * 1000).valueOf())
        }, function(err, dataSources){
          assert.ok(!err, "Expected No Error " + util.inspect(err));

          assert.equal(1, dataSources.length);
          assert.equal(dsId.toString(), dataSources[0]._id.toString());
          cb();
        });
      },
      function(cb){
        //Update The Cache Again
        forms.dataSources.updateCache(options, [dataSourceDataSet], {
          currentTime: new Date()
        }, function(err){
          assert.ok(!err, "Expected No Error");
          cb();
        });
      },
      function(cb){
        //Should Be No Data Sources Needing An Update Again.
        forms.dataSources.list(options, {
          listDataSourcesNeedingUpdate: true,
          currentTime: new Date()
        }, function(err, dataSources){
          assert.ok(!err, "Expected No Error " + util.inspect(err));

          assert.equal(0, dataSources.length);
          cb();
        });
      }
    ], done);
  },
  "Test Update Data Source Data Set Wrong Format": function(done){
    var testDataSource = _.clone(dataSourceData);
    testDataSource.name = "testDSWrongDataFormat";

    var dataSourceDataSingleChoice = {
      data: [
        dataOptions.option1(false),
        dataOptions.option2(true)
      ]
    };

    forms.dataSources.create(options, testDataSource, function(err, createdDataSource){
      assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

      dataSourceDataSingleChoice._id = createdDataSource._id;

      forms.dataSources.updateCache(options, [dataSourceDataSingleChoice], {
        currentTime: new Date()
      }, function(err, updateResult){
        assert.ok(!err, "Unexpected Error When Updating Data Source Data: " + util.inspect(err) );

        var validUpdates = updateResult.validDataSourceUpdates;
        var invalidUpdates = updateResult.invalidDataSourceUpdates;

        assert.equal(1, validUpdates.length, "Expected 1 valid update");
        assert.equal(0, invalidUpdates.length, "Expected 0 invalid updates");

        assert.ok(validUpdates[0]._id, "Expected An Updated Data Source");

        //Updating A Data Source With Junk Data Should Maintain The Latest Correct Data Set
        dataSourceDataSingleChoice.data = [
          {
            wrongvalue: "wrong label 1"
          }
        ];

        forms.dataSources.updateCache(options, [dataSourceDataSingleChoice], {
          currentTime: new Date()
        }, function(err, badUpdateResult){
          assert.ok(err, "Expected An Error When Updating Data Sources With Bad Data");
          assert.equal(ERROR_CODES.FH_FORMS_UNEXPECTED_ERROR, err.code, "Expected A FH_FORMS_UNEXPECTED_ERROR");

          var validUpdates = badUpdateResult.validDataSourceUpdates;
          var invalidUpdates = badUpdateResult.invalidDataSourceUpdates;

          assert.equal(0, validUpdates.length, "Expected 0 valid update");
          assert.equal(1, invalidUpdates.length, "Expected 1 invalid updates");

          var badUpdate = invalidUpdates[0];

          var expectedResult = _.clone(dataSourceDataSingleChoice);

          expectedResult.error = {
            code: ERROR_CODES.FH_FORMS_INVALID_PARAMETERS,
            userDetail: "Invalid Data For Cache Update.",
            systemDetail: "DataSource validation failed: cache.0.data.0.value: Path `value` is required."
          };

          verifyDataSourceJSON(expectedResult, badUpdate);

          verifyBackoffIncrement(dataSourceDataSingleChoice._id, 1, done);
        });
      });
    });
  },
  "Test Update Data Source With Data Error": function(done){
    //Should Test An Error Expected To Be Stored With The Data Source

    var testErrorDataSource = _.clone(dataSourceData);
    testErrorDataSource.name = "testDSDataError";
    var testDate = new Date();

    async.series([
      function createDataSource(cb){
        forms.dataSources.create(options, testErrorDataSource, function(err, createdDataSource) {
          assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

          testErrorDataSource._id = createdDataSource._id;
          cb();
        });
      },
      function(cb){
        testErrorDataSource.dataError = {
          userDetail: "Error Getting Data From Service",
          systemDetail: "Invalid Response Code 500",
          code: "SERVICE_NOT_AVAILABLE"
        };

        forms.dataSources.updateCache(options, [testErrorDataSource], {
          currentTime: testDate
        }, function(err, errUpdateResult){
          assert.ok(!err, "Expected No Error " + util.inspect(err));


          //It Should Be A Valid Data Source Update With An Error
          assert.ok(errUpdateResult.validDataSourceUpdates[0]);
          assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.status, "error");
          assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.error.userDetail, "Error Getting Data From Service");
          assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.error.systemDetail, "Invalid Response Code 500");
          assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.error.code, "SERVICE_NOT_AVAILABLE");
          cb();
        });
      },
      //The backoff index should have incremented
      function verifyBackoff(cb){
        verifyBackoffIncrement(testErrorDataSource._id, 1, cb);
      }
    ], done);
  },
  "Test Update Data Source Reset Backoff Index": function(done){

    var testBackoffIndexDataSource = _.clone(dataSourceData);
    testBackoffIndexDataSource.name = "testDSBackoffIndexReset";

    //Utility function to update a cache entry with an error
    function updateCacheWithError(cb){
      var testDate = new Date();
      testBackoffIndexDataSource.dataError = {
        userDetail: "Error Getting Data From Service",
        systemDetail: "Invalid Response Code 500",
        code: "SERVICE_NOT_AVAILABLE"
      };

      forms.dataSources.updateCache(options, [testBackoffIndexDataSource], {
        currentTime: testDate
      }, function(err, errUpdateResult){
        assert.ok(!err, "Expected No Error " + util.inspect(err));


        //It Should Be A Valid Data Source Update With An Error
        assert.ok(errUpdateResult.validDataSourceUpdates[0]);
        assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.status, "error");
        assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.error.userDetail, "Error Getting Data From Service");
        assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.error.systemDetail, "Invalid Response Code 500");
        assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.error.code, "SERVICE_NOT_AVAILABLE");
        cb();
      });
    }

    //Utility function to update a cache entry with a valid data set
    function updateCacheWithValidData(cb){
      var testDate = new Date();
      var updatedSingleChoiceData = {
        data: [
          dataOptions.option2(true),
          dataOptions.option1(false)
        ]
      };
      updatedSingleChoiceData._id = testBackoffIndexDataSource._id;

      forms.dataSources.updateCache(options, [updatedSingleChoiceData], {
        currentTime: testDate
      }, function(err, errUpdateResult){
        assert.ok(!err, "Expected No Error " + util.inspect(err));


        //It Should Be A Valid Data Source Update
        assert.ok(errUpdateResult.validDataSourceUpdates[0]);
        assert.equal(errUpdateResult.validDataSourceUpdates[0].currentStatus.status, "ok");
        cb();
      });
    }

    async.series([
      function createDataSource(cb){
        logger.debug("testBackoffIndexDataSource1", testBackoffIndexDataSource);
        forms.dataSources.create(options, testBackoffIndexDataSource, function(err, createdDataSource) {
          assert.ok(!err, "Unexpected Error: dataSource.create" + util.inspect(err));

          testBackoffIndexDataSource._id = createdDataSource._id;
          logger.debug("testBackoffIndexDataSource2", testBackoffIndexDataSource);
          cb();
        });
      },
      updateCacheWithError,
      //The backoff index should have incremented
      function verifyBackoff(cb){
        verifyBackoffIncrement(testBackoffIndexDataSource._id, 1, cb);
      },
      updateCacheWithError,
      //The backOffIndex should increment again
      function verifyBackoff(cb){
        verifyBackoffIncrement(testBackoffIndexDataSource._id, 2, cb);
      },
      updateCacheWithValidData,
      //After a valid update, the backOffIndex should reset to 0
      function verifyBackoff(cb){
        verifyBackoffIncrement(testBackoffIndexDataSource._id, 0, cb);
      },
    ], done);
  },
  "Test Validate Data Source Data": function(done){
    //Forms Should Have A Separate Function To Validate A Data Set.

    var baseDataSourceData = _.clone(dataSourceData);

    var dataSourceDataSingleChoice = _.extend({
      data: [
        dataOptions.option1(false),
        dataOptions.option2(true)
      ]
    }, baseDataSourceData);

    var dataSourceDataNoChoice = _.extend({
      data: [
      ]
    }, baseDataSourceData);


    async.series([
      function(cb){
        forms.dataSources.validate(options, dataSourceDataSingleChoice, function(err, validationResult){
          assert.ok(!err, "Expected No Validation Error");

          //The Validation Result Should Be A Full DataSource Object With Validation Data - Useful for the user if they want to see the data that was validated.
          var expectedResult = _.clone(dataSourceDataSingleChoice);

          expectedResult.dataHash = misc.generateHash(dataSourceDataSingleChoice.data);
          expectedResult.validationResult = {
            valid: true,
            message: "Data Source Is Valid"
          };

          verifyDataSourceJSON(expectedResult, validationResult);

          cb();
        });
      },
      function(cb){
        forms.dataSources.validate(options, dataSourceDataNoChoice, function(err, validationResult){
          assert.ok(!err, "Expected No Error");

          var expectedResult = _.clone(dataSourceDataNoChoice);

          expectedResult.dataHash = misc.generateHash(dataSourceDataNoChoice.data);
          expectedResult.validationResult = {
            valid: false,
            message: "Invalid Data Source Update Data."
          };

          verifyDataSourceJSON(expectedResult, validationResult);

          cb();
        });
      }
    ], done);
  },
  "Test Validate Data Source No Key, Selected Applied": function(done) {
    var baseDataSourceData = _.clone(dataSourceData);

    async.series([
      function validateNoKey(cb) {
        var dataSourceDataNoKey = _.extend({
          data: [
            dataOptions.optionNoKey(),
            dataOptions.optionNoSelected(),
            dataOptions.optionValueOnly()
          ]
        }, baseDataSourceData);
        forms.dataSources.validate(options, dataSourceDataNoKey, function(err, validationResult) {
          assert.ok(!err, "Expected No Error");

          var expectedResult = _.clone(dataSourceDataNoKey);

          expectedResult.dataHash = misc.generateHash(dataSourceDataNoKey.data);
          expectedResult.validationResult = {
            valid: true,
            message: "Data Source Is Valid"
          };

          verifyDataSourceJSON(expectedResult, validationResult);

          cb();
        });
      }
    ], done);
  }


};
