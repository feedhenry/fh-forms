var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CONSTANTS = require('./constants.js');
var FORM_CONSTANTS = CONSTANTS.FORM_CONSTANTS;

var schemas = require('./schemas');

module.exports = function() {
  var MODELNAMES = CONSTANTS.MODELNAMES;

  return {
    "init": function(conn, config, filter) {
      config = config || {};
      var schemaOptions = { strict: true,  versionKey: false  };

      ///GROUPS ARE NOW REDUNDANT, NOT NEEDED ANY MORE
      var groupsSchema = new Schema({
        "name": {type: String, required: true},
        "users" : [{ type: String, required: true}],
        "forms": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.FORM, required: true}],
        "apps" : [{ type: String, required: true}],
        "themes": [{ type: Schema.Types.ObjectId, ref: MODELNAMES.THEME, required: true}]
      }, schemaOptions);

      groupsSchema.pre('save', function(next) {
        if (null === this.users) {
          this.users = [];
        }
        if (null === this.forms) {
          this.forms = [];
        }
        if (null === this.apps) {
          this.apps = [];
        }
        if (null === this.themes) {
          this.themes = [];
        }
        next();
      });

      ///GROUPS ARE NOW REDUNDANT, NOT NEEDED ANY MORE

      this.attachSchemas(conn, groupsSchema, config, filter);


      /*
      conn.model(MODELNAMES.FORM, schemas.form());
      conn.model(MODELNAMES.PAGE, schemas.page());
      conn.model(MODELNAMES.FIELD, schemas.field());
      conn.model(MODELNAMES.FIELD_RULE, schemas.fieldRule());
      conn.model(MODELNAMES.PAGE_RULE, schemas.pageRule());
      conn.model(MODELNAMES.THEME, schemas.theme());
      conn.model(MODELNAMES.APP_FORMS, schemas.projectForms());
      conn.model(MODELNAMES.APP_THEMES, schemas.projectTheme());
      conn.model(MODELNAMES.FORM_SUBMISSION, schemas.submission());
      conn.model(MODELNAMES.GROUPS, groupsSchema);
      conn.model(MODELNAMES.APP_CONFIG, schemas.projectConfig());
      conn.model(MODELNAMES.DATA_SOURCE, schemas.dataSource(config));
      conn.model(MODELNAMES.DATA_TARGET, schemas.dataTarget());
      conn.model(MODELNAMES.DATA_SOURCE_AUDIT_LOG, schemas.dataSourceCache.dataSourceAuditLogEntry());*/
    },
    "attachSchemas": function(conn, groupsSchema, config, filter) {
      var tuple = [
        [MODELNAMES.FORM, schemas.form, []],
        [MODELNAMES.PAGE, schemas.page, []],
        [MODELNAMES.FIELD, schemas.field, []],
        [MODELNAMES.FIELD_RULE, schemas.fieldRule, []],
        [MODELNAMES.PAGE_RULE, schemas.pageRule, []],
        [MODELNAMES.THEME, schemas.theme, []],
        [MODELNAMES.APP_FORMS, schemas.projectForms, []],
        [MODELNAMES.APP_THEMES, schemas.projectTheme, []],
        [MODELNAMES.FORM_SUBMISSION, schemas.submission, []],
        [MODELNAMES.GROUPS, function() {
          return groupsSchema;
        }, []],
        [MODELNAMES.APP_CONFIG, schemas.projectConfig, []],
        [MODELNAMES.DATA_SOURCE, schemas.dataSource, [config]],
        [MODELNAMES.DATA_TARGET, schemas.dataTarget, []],
        [MODELNAMES.DATA_SOURCE_AUDIT_LOG, schemas.dataSourceCache.dataSourceAuditLogEntry, []]
      ];

      tuple.forEach(function(item) {
        var modelName = item[0];
        var schema = item[1];
        var args = item[2];

        if (!filter) {
          conn.model(modelName, schema(...args));
        } else { 
          if (filter.indexOf(modelName) !== -1) {
            conn.model(modelName, schema(...args));
          }
        }
      });
    },
    "get": function(conn, modelName) {
      return conn.model(modelName);
    },
    "MODELNAMES": MODELNAMES,
    "FORM_CONSTANTS": FORM_CONSTANTS,
    "CONSTANTS": CONSTANTS,
    "convertDSCacheToFieldOptions": schemas.dataSourceCache.convertDSCacheToFieldOptions
  };
};
