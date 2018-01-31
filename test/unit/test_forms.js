var proxyquire = require('proxyquire');
var assert = require('assert');
var sinon = require('sinon');

var mongoClientConnection = sinon.stub();
var mongooseConnection = sinon.stub();
var modelInitStub = sinon.stub();

var underTest = proxyquire('../../lib/forms.js', {
    './utils/setup_connections': {
        getMongooseConnection: function(uri, conn, cb) {
            cb(null, {});
        },
        getMongoConnection: function(uri, conn, cb) {
            cb(null, {});
        }
    },
    '../lib/common/models.js': function() {
        return {
            init: modelInitStub
        };
    }
});

exports.testSystemDbConnection = function(done) {
    var options = {
        uri: 'mongodb://user:pass@system.db:27017/systemdb'
    };
    underTest.initConnection(options, function(err) {
        assert.ok(!err);
        assert.ok(underTest.connections['mongodb://user:pass@system.db:27017/systemdb'].mongooseConnection);
        assert.ok(underTest.connections['mongodb://user:pass@system.db:27017/systemdb'].databaseConnection);
        assert.ok(!underTest.connections['mongodb://user:pass@user.db:27017/userdb']);
        assert.ok(!underTest.connections['mongodb://user:pass@user.db:27017/userdb']);
        done();
    });
};

exports.testUserDbConnection = function(done) {
    var options = {
        uri: 'mongodb://user:pass@system.db:27017/systemdb',
        submissionUri: 'mongodb://user:pass@user.db:27017/userdb'
    };
    underTest.initConnection(options, function(err) {
        assert.ok(!err);
        assert.ok(underTest.connections['mongodb://user:pass@system.db:27017/systemdb'].mongooseConnection);
        assert.ok(underTest.connections['mongodb://user:pass@system.db:27017/systemdb'].databaseConnection);
        assert.ok(underTest.connections['mongodb://user:pass@user.db:27017/userdb'].submissionMongooseConnection);
        assert.ok(underTest.connections['mongodb://user:pass@user.db:27017/userdb'].submissionDatabaseConnection);
        done();
    });
};
