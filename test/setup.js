var proxyquire = require('proxyquire').noCallThru(),
  application;

var logger = require('../lib/common/logger');

var log = logger.getLogger();

var testAppFormsDb = "testAppFormsDb";
var DB = require('mongodb').Db;
var Server = require('mongodb').Server;
var async = require('async');
var testEnv = require('./Fixtures/env.js');
var assert = require('assert');
var testsConfig = {
  "dbUser": "appformsuser",
  "dbPassword": "appformspass",
  "dbAddress": process.env.MONGODB_HOST || "localhost",
  "dbPort": 27017,
  "dbForTests": "testAppFormsDb"
};

var models = require('../lib/common/models.js')();

//Need test data for fields, pages, forms, themes, appforms, appthemes,

var fieldText = {
  "_id": "123456789",
  "label": "SingleText Field",
  "helpText": "This is test single text Field 1.",
  "type": "singleText",
  "options": [{"key": "maxLength", "val": "100"}],
  "required": false
};

var fieldMultiText = {
  "_id": "123456788",
  "label": "MultiText Field",
  "helpText": "This is multi text Field 1.",
  "type": "multiText",
  "options": [{"key": "maxLength", "val": "900"}],
  "required": false
};

var fieldNumber = {
  "_id": "123456787",
  "label": "Number Field",
  "helpText": "This is number Field 1.",
  "type": "number",
  "options": [],
  "required": false
};

var fieldEmail = {
  "_id": "123456786",
  "label": "Email Address Field",
  "helpText": "This is email Field 1.",
  "type": "email",
  "options": [],
  "required": false
};

var fieldDropdownList = {
  "_id": "123456785",
  "label": "Dropdown List Field",
  "helpText": "This is dropDownList Field 1.",
  "type": "dropDownList",
  "options": [{"key": "Drop Option 1", val: ""}, {"key": "Drop Option 2", "val": "selected"}], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldRadioButton = {
  "_id": "123456784",
  "label": "Radio Button Field",
  "helpText": "This is Radio Button Field 1.",
  "type": "radioButton",
  "options": [{"key": "Radio Option 1", val: ""}, {"key": "Radio Option 2", "val": "selected"}], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldCheckbox = {
  "_id": "123456783",
  "label": "Checkbox Field",
  "helpText": "This is Checkbox Field 1.",
  "type": "checkbox",
  "options": [{"key": "Check Option 1", val: "selected"}, {"key": "Check Option 2", "val": "selected"}], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldCheckbox = {
  "_id": "123456782",
  "label": "Checkbox Field",
  "helpText": "This is Checkbox Field 1.",
  "type": "checkbox",
  "options": [{"key": "Check Option 1", val: "selected"}, {"key": "Check Option 2", "val": "selected"}], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldLocationLatLong = {
  "_id": "123456781",
  "label": "LocationLatLong Field",
  "helpText": "This is LocationLatLong Field 1.",
  "type": "locationLatLong",
  "options": [], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldLocationNorthEast = {
  "_id": "123456780",
  "label": "fieldLocationNorthEast Field",
  "helpText": "This is fieldLocationNorthEast Field 1.",
  "type": "locationNorthEast",
  "options": [], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldLocationPhoto = {
  "_id": "123456779",
  "label": "Photo Field",
  "helpText": "This is Photo Field 1.",
  "type": "photo",
  "options": [{"key": "convertWidth", "val": "200"}, {"key": "convertHeight", "val": "200"}], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldLocationSignature = {
  "_id": "123456778",
  "label": "Signature Field",
  "helpText": "This is Signature Field 1.",
  "type": "signature",
  "options": [{"key": "convertWidth", "val": "200"}, {"key": "convertHeight", "val": "200"}], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldLocationFile = {
  "_id": "123456777",
  "label": "File Field",
  "helpText": "This is File Field 1.",
  "type": "file",
  "options": [], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldDate = {
  "_id": "123456776",
  "label": "Date Field",
  "helpText": "This is Date Field 1.",
  "type": "date",
  "options": [], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldTime = {
  "_id": "123456775",
  "label": "Time Field",
  "helpText": "This is Time Field 1.",
  "type": "time",
  "options": [], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldDateTime = {
  "_id": "123456774",
  "label": "DateTime Field",
  "helpText": "This is DateTime Field 1.",
  "type": "dateTime",
  "options": [], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};

var fieldSectionBreak = {
  "_id": "123456773",
  "label": "SectionBreak Field",
  "helpText": "This is SectionBreak Field 1.",
  "type": "sectionBreak",
  "options": [{"key": "sectionTitle", "val": "Some Section Title"}, {
    "key": "sectionDescription",
    "val": "I am a section."
  }], // Only one can be selected at a time. Part of validation. Has to have at least one entry.
  "required": false
};


///////////////////////// PAGES//////////////////////

var pageTest1 = {
  "_id": "page1ID123456789",
  "name": "The First Page",
  "description": "The First Page Description.",
  "fields": ["123456789", "123456788", "123456787"]
}

var pageTest2 = {
  "_id": "page2ID123456788",
  "name": "The Second Page",
  "description": "The Second Page Description.",
  "fields": ["123456786", "123456785", "123456784"]
}


//////////////////////FORMS ///////////////////////////


exports.setUp = function (finish) {

  initDatabase(assert, function (err) {
    assert.ok(!err);

    finish();
  });

}

exports.tearDown = function (finish) {
  cleanDatabase(assert, function (err) {
    if (err) console.log(err);
    finish();
  });
}

function cleanDatabase(assert, cb) {
  var db = new DB(testAppFormsDb, new Server(testsConfig.dbAddress, testsConfig.dbPort), {"w": 1, j: false});

  db.open(function (err, db) {
    assert.ok(!err, err);
    assert.ok(db);

    db.authenticate("admin", "admin", {"authSource": "admin"}, function (err, ok) {
      assert.ok(!err, err);

      db.dropDatabase(function (err, ok) {
        assert.ok(!err, err);

        db.close(cb);
      });
    });
  });
}

function setUpDatabase(assert, callback) {
  log.debug("setUpDatabase");
  var db = new DB(testAppFormsDb, new Server(testsConfig.dbAddress, testsConfig.dbPort), {"w": 1, j: false});

  async.waterfall([
    function(cb){
      db.open(cb);
    },
    function (db, cb) {
      log.debug("setUpDatabase authenticating");
      db.authenticate("admin", "admin", {"authSource": "admin"}, function (err, ok) {
        assert.ok(!err);
        log.debug("ok", ok);

        cb(err, db);
      });
    },
    function (db, cb) {
      db.removeUser(testsConfig.dbUser, function (err) {
        cb(null, db);
      });
    },
    function (db, cb) {
      db.addUser(testsConfig.dbUser, testsConfig.dbPassword, {
        roles: ['dbOwner']
      }, function (err, ok) {
        log.debug("User Add", ok);
        assert.ok(!err, err);

        db.close(cb);
      });
    }
  ], callback);
}

function initDatabase(assert, cb) {
  cleanDatabase(assert, function (err) {
    assert.ok(!err);

    setUpDatabase(assert, function (err) {
      assert.ok(!err);

      return cb(err);
    });
  });
}

module.exports.initDatabase = initDatabase;
module.exports.cleanDatabase = cleanDatabase;


