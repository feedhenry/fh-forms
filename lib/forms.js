var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('async');
var models = require('../lib/common/models.js')();
var validate = require('./common/validate.js');
var getForms = require('./impl/getForms.js')();
var groups = require('./impl/groups.js');
var appConfig = require('./impl/appConfig.js')();
var logfns = require('../lib/common/logger.js');
var deleteAppReferences = require('./impl/deleteAppRefrences.js');
var dataSourceImpl = require('./impl/dataSources');
var dataTargetImpl = require('./impl/dataTargets');
var config = require('./config');
var logger = logfns.getLogger();
var setupConnections = require('./utils/setup_connections');

var forms = {
  sharedConnections : {},
  connections: {},
  setConfig: config.set,

  initConnection : function(options, cb) {
    var self = this;
    var uri = options.uri;
    var key = options.key || uri;
    var config = options.config || {};
    if ( self.connections[key] ) {
      return cb(undefined, self.connections[key]);
    }
    mongoose.Promise = global.Promise;
    var paramValidation = validate(options);

    logger.info("Initialising mongo connections");

    async.series({
      validateParam: function(cb) {
        logger.debug("valid params", options);
        paramValidation.has("uri", function(failed) {
          if (failed) {
            return cb(new Error("Invalid Params: " + JSON.stringify(failed)));
          } else {
            return cb();
          }
        });
      },
      mongooseConnection: async.apply(setupConnections.getMongooseConnection, uri, forms.sharedConnections.mongooseConnection),
      mongoConnection: async.apply(setupConnections.getMongoConnection, uri, forms.sharedConnections.mongodbConnection)
    }, function(err, requiredConnections) {
      if (err) {
        logger.error("Error connecting to mongo using client", err);
        return cb(err);
      }

      logger.info("Connected to mongo", {requiredConnections: requiredConnections});

      var connections =  {
        "mongooseConnection": requiredConnections.mongooseConnection,
        "databaseConnection": requiredConnections.mongoConnection
      };

      self.connections[key] = connections;

      // [db-inspect] initialising the models over the mongoose connection
      models.init(connections.mongooseConnection, config); //Initialise the models on the created mongoose connection.

      return cb(undefined, connections);
    });
  },

  tearDownConnection : function(options, cb) {
    var self = this;
    var uri = options.uri;
    var key = options.key || uri;


    if ( self.connections[key] ) {
      self.connections[key].mongooseConnection.close(function(err) {
        if (err) {
          console.error(err);
        }

        self.connections[key].databaseConnection.close(function(err) {
          if (err) {
            console.error(err);
          }

          delete self.connections[key];

          return cb(err);
        });
      });
    } else  {
      cb(null);
    }
  },

  /**
   * Set the shared db connections for the module.
   * @param {object} dbConnections shared database connections
   * @param {object} dbConnections.mongodbConnection shared mongodb connection
   * @param {object} dbConnections.mongooseConnection shared mongoose connection
   */
  setSharedConnections: function(dbConnections) {
    forms.sharedConnections = {
      mongodbConnection: dbConnections.mongodbConnection,
      mongooseConnection: dbConnections.mongooseConnection
    };
  },

  getForms: function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }


      return getForms.getForms(connections, options, cb);
    });
  },

  findForms: function(options, formsList, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return getForms.findForms(connections, formsList, cb);
    });
  },

  submissionSearch: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/searchSubmissions.js').submissionSearch(connections, options, params, cb);
    });
  },


  getForm: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getForm.js')(connections, options, cb);
    });
  },

  getAllForms: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      options.getAllForms = true;
      return getForms.getForms(connections, options, cb);
    });
  },


  /**
   * importForms - Importing Form Definitions From A ZIP File.
   *
   * @param  {object}   options
   * @param  {string}   options.zipFile     A Path to a ZIP file on the file system.
   * @param  {string}   options.workingDir  A Path to a directory where the zip file can be unzipped to.
   * @param  {string}   options.url         The Mongo Database Connection URL.
   * @param  {function} callback
   * @return {type}
   */
  importForms: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/importForms').importForms(connections, options, cb);
    });
  },

  deleteForm : function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return require('./impl/deleteForm.js')(connections, options, cb);
    });
  },

  getTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }


      if (options.appId) {
        return require('./impl/getThemeForApp.js')(connections, options, cb);
      } else {
        return require('./impl/getTheme.js')(connections, options, cb);
      }
    });
  },

  getAppTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return require('./impl/getThemeForApp.js')(connections, options, cb);
    });
  },

  setAppTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return require('./impl/setThemeForApp.js')(connections, options, cb);
    });
  },

  createTheme : function(options, themeData, cb) {
    var self = this;

    delete themeData._id;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/updateTheme.js')(connections, options, themeData, cb);
    });
  },

  updateOrCreateTheme : function(options, themeData, cb) {
    var self = this;

    options.createIfNotFound = true;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/updateTheme.js')(connections, options, themeData, cb);
    });
  },

  updateTheme : function(options, themeData, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/updateTheme.js')(connections, options, themeData, cb);
    });
  },

  cloneTheme: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/cloneTheme.js')(connections, options, cb);
    });
  },

  exportThemes: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/exportThemes.js')(connections, options, cb);
    });
  },
  importThemes: function(options, themesToImport, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/importThemes.js')(connections, options, themesToImport, cb);
    });
  },

  deleteTheme : function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return require('./impl/deleteTheme.js')(connections, options, cb);
    });
  },

  getThemes : function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getThemes.js')(connections, options, cb);
    });
  },

  updateOrCreateForm: function(options, formData, cb) {
    var self = this;

    options.createIfNotFound = true;
    self.updateForm(options, formData, cb);
  },

  updateForm: function(options, formData, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/updateForm.js')(connections, options, formData, cb);
    });
  },

  cloneForm: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/cloneForm.js')(connections, options, cb);
    });
  },

  getSubmissions: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getSubmissions')(connections, options, params, cb);
    });
  },

  //Exports Submissions As CSV Files
  exportSubmissions: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/exportSubmissions.js')(connections, options, params, cb);
    });
  },

  //Exports Submissions As CSV Files
  startCSVExport: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/startSubmissionCSVExport.js')(connections, options, cb);
    });
  },

  getCSVExportStatus: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/submissionExportHelper/getCSVExportStatus.js')(connections, cb);
    });
  },

  updateCSVExportStatus: function(options, status, cb) {
    var self = this;

    //Don't have to pass a callback, updates will be synced on the mongo server with write locks.
    cb = cb || _.noop;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/submissionExportHelper/updateCSVExportStatus.js')(connections, status, cb);
    });
  },

  resetExportCSV: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/submissionExportHelper/resetCSVExportStatus.js')(connections, cb);
    });
  },

  getSubmission: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getSubmission.js')(connections, options, params, cb);
    });
  },

  getSubmissionEmailData: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getSubmissionEmailData.js')(connections, options, params, cb);
    });
  },

  generateSubmissionPdf: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/generatePDF.js')(connections, options, cb);
    });
  },

  deleteSubmission: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/deleteSubmission.js')(connections, options, params, cb);
    });
  },

  getSubmissionFile: function(options, params, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getSubmissionFile.js')(connections, options, params, cb);
    });
  },

  submitFormData: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }


      return require('./impl/submitFormData.js')(connections, options, cb);
    });
  },

  submitFormFile: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      logger.info("Submit Form File: ", options);


      return require('./impl/submitFormFile.js')(connections, options, cb);
    });
  },

  completeFormSubmission: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }


      return require('./impl/completeFormSubmission.js')(connections, options, cb);
    });
  },

  getSubmissionStatus: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }


      return require('./impl/getSubmissionStatus.js')(connections, options, cb);
    });
  },

  updateSubmission : function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      // create & update submission both use same impl
      return require('./impl/submitFormData.js')(connections, options, cb);
    });
  },

  updateSubmissionFile : function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }


      return require('./impl/updateSubmissionFile.js').updateSubmissionFile(connections, options, cb);
    });
  },

  getNotifications : function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/getNotifications.js')(connections, options, cb);
    });
  },

  updateNotifications : function(options, subscribers, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/updateNotifications.js')(connections, options, subscribers, cb);
    });
  },

  getFormApps: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/formapps.js').getFormApps(connections, options, cb);
    });
  },

  getPopulatedFormList: function(options, cb) {
    var self = this;
    self.initConnection(options,function(err, connections) {
      if (err) {
        return cb(err);
      }
      return require('./impl/getPopulatedFormsList.js')(connections, options, cb);
    });
  },

  updateAppForms: function(options, appForms, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/appforms.js').updateAppForms(connections, options, appForms, cb);
    });
  },

  getAppFormsForApp: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/appforms.js').getAppFormsForApp(connections, options, cb);
    });
  },

  getAllAppForms: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/appforms.js').getAllAppForms(connections, options, cb);
    });
  },

  exportForms: function(options, callback) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return callback(err);
      }

      return require('./impl/exportForms.js')(connections, callback);
    });
  },

  exportAppForms: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/exportAppforms.js')(connections, options, cb);
    });
  },

  importAppForms: function(options, appFormsToImport, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/importAppforms.js')(connections, options, appFormsToImport, cb);
    });
  },

  exportAppConfig: function(options, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/exportAppConfig.js')(connections, options, cb);
    });
  },

  importAppConfig: function(options, configToImport, cb) {
    var self = this;

    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }

      return require('./impl/importAppConfig.js')(connections, options, configToImport, cb);
    });
  },

  getAllAppsForUser: function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.getAppsForUser(connections, options.restrictToUser, function(err, allowedApps) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, allowedApps);
      });
    });
  },

  getAllGroups: function(options, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.getAllGroups(connections, options, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  getGroup: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.getGroup(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  updateGroup: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.updateGroup(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  addAppToUsersGroups : function(options,params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.addAppToUsersGroups(connections,params.restrictToUser,params.appId, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  createAppConfig: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return appConfig.createAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  updateAppConfig: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return appConfig.updateAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  getAppConfig: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return appConfig.getAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  setAppConfig: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return appConfig.setAppConfig(connections, options, params, cb);
    });
  },

  deleteAppConfig: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return appConfig.deleteAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        return cb(undefined, result);
      });
    });
  },

  getAppClientConfig: function(options, cb) {
    var self = this;
    var params = {appId: options.appId};
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return appConfig.getAppConfig(connections, options, params, function(err, result) {
        if (err) {
          return cb(err);
        }
        var clientConfig = result.client;
        var config_admin_user = false;
        if (options.deviceId && clientConfig.config_admin_user && (clientConfig.config_admin_user.length > 0)) {
          config_admin_user = deviceInClientAdminUserList(options.deviceId, clientConfig.config_admin_user);
        }
        clientConfig.config_admin_user = config_admin_user;
        return cb(undefined, clientConfig);

        function deviceInClientAdminUserList(deviceId, deviceList) {
          return deviceList.indexOf(deviceId) >= 0;
        }
      });
    });
  },

  createGroup: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.createGroup(connections, options, params, cb);
    });
  },

  deleteGroup: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return groups.deleteGroup(connections, options, params, cb);
    });
  },

  deleteAppReferences: function(options, params, cb) {
    var self = this;
    self.initConnection(options, function(err, connections) {
      if (err) {
        return cb(err);
      }
      return deleteAppReferences.deleteAppRefrences(connections, options, params, cb);
    });
  },

  setLogger: function(logger) {
    return logfns.setLogger(logger);
  },
  dataSources: {
    get: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.get(connections, params, cb);
      });
    },
    getAuditLogEntry: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.getAuditLogEntry(connections, params, cb);
      });
    },
    create: function(options, dataSource, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.create(connections, dataSource, cb);
      });
    },
    list: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.list(connections, params, cb);
      });
    },
    update: function(options, dataSource, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.update(connections, dataSource, cb);
      });
    },
    deploy: function(options, dataSource, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.deploy(connections, dataSource, cb);
      });
    },
    updateCache: function(options, dataSources, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.updateCache(connections, dataSources, params, cb);
      });
    },
    validate: function(options, dataSource, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.validate(connections, dataSource, cb);
      });
    },
    remove: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataSourceImpl.remove(connections, params, cb);
      });
    }
  },
  dataTargets: {
    get: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataTargetImpl.get(connections, params, cb);
      });
    },
    create: function(options, dataTarget, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataTargetImpl.create(connections, dataTarget, cb);
      });
    },
    list: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataTargetImpl.list(connections, params, cb);
      });
    },
    update: function(options, dataTarget, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataTargetImpl.update(connections, dataTarget, cb);
      });
    },
    validate: function(options, dataTarget, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataTargetImpl.validate(connections, dataTarget, cb);
      });
    },
    remove: function(options, params, cb) {
      forms.initConnection(options, function(err, connections) {
        if (err) {
          return cb(err);
        }

        return dataTargetImpl.remove(connections, params, cb);
      });
    }
  }
};


module.exports = forms;
