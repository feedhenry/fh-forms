var _ = require('underscore');
var logger = require('../common/logger.js').getLogger();


module.exports = function() {
  var models = require('../common/models.js')();
  var validate = require('../common/validate.js');
  var async = require('async');
  var groups = require('./groups.js');
  var appforms = require('./appforms.js');
  var misc = require('../common/misc.js');

  // [db-inspect] read forms. not sure if form definitions - if so the this is possibly system data.
  function findForms(connections, listOfIds, cb) {
    var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);

    var loadAllForms = listOfIds === null;

    if (!_.isArray(listOfIds)) {
      listOfIds = [listOfIds];
    }

    listOfIds = _.filter(listOfIds, _.isString);

    //If there is a list of form ids to filter, then apply the query on the id field.
    var query = loadAllForms ? {} : {_id: {$in: listOfIds}};

    Form.find(query).exec(function(err, foundForms) {
      foundForms = foundForms || [];

      cb(err, foundForms);
    });
  }

  function getForms(connections, options, cb) {

    var Submission = models.get(connections.mongooseConnection, models.MODELNAMES.FORM_SUBMISSION);
    var AppForm = models.get(connections.mongooseConnection, models.MODELNAMES.APP_FORMS);
    var foundAppForms = [];
    var resJSON;
    var formStatistics = {}; //Form statistics is
    //Size for all submissions in a form.
    var fileSizesByForm = [];

    async.series([validateParams, getFormsForAppId, getSubmissionStorage, buildFormStatistics, constructResultJSON], function(err) {
      if (err) {
        return cb(err);
      } else {
        return cb(undefined, resJSON);
      }
    });

    /**
     * Function for getting the current submission storage.
     *
     * Submission Storage = formsubmissions + fileStorage.chunks + fileStorage.files
     */
    function getSubmissionStorage(cb) {
      //If no stats are required, don't try and do the map-reduce operation.
      if (options.notStats) {
        return cb();
      }
      //Need a map-reduce operation to count the files, otherwise would have to load all submissions into memory which is bad.
      var mapFileSizesFunction = function() {
        var key = this.formId;

        var formFields = this.formFields || [];

        //Iterating over all form fields
        for (var formFieldIdx = 0; formFieldIdx < formFields.length; formFieldIdx++) {
          var formField = formFields[formFieldIdx];

          var fieldValues = formField.fieldValues || [];

          //Iterating over all of the field values
          for (var fieldValueIdx = 0 ; fieldValueIdx < fieldValues.length ; fieldValueIdx++) {
            var fieldValue = fieldValues[fieldValueIdx] || {};

            //If the value has a file size associated with it, then emit that file size
            if (fieldValue.fileSize) {
              emit(key, fieldValue.fileSize); // eslint-disable-line no-undef
            }
          }
        }
      };

      //Function to sum up all of the file sizes for each submission
      var reduceFileSizesFunction = function(formId, fileSizes) {
        var totalFileSizes = 0;

        for (var fileSizeIdx = 0; fileSizeIdx < fileSizes.length ; fileSizeIdx++) {
          totalFileSizes += fileSizes[fileSizeIdx];
        }

        return totalFileSizes;
      };

      logger.debug("getSubmissionStorage", {options: options});

      //Map-Reduce Operation to count the file sizes.
      connections.databaseConnection.collection('formsubmissions').mapReduce(mapFileSizesFunction, reduceFileSizesFunction, {out : {inline: 1}, verbose:true}, function(err, results) {
        logger.debug("getSubmissionStorage", {err: err, results: results});
        if (err) {

          //If there are no submissions, then the collection does not exist. No need to error out of the request.
          if (err.message.indexOf("ns doesn't exist") > -1) {
            return cb();
          } else {
            return cb(err);
          }
        }

        fileSizesByForm = results;

        return cb();
      });
    }


    function buildFormStatistics(cb) {
      if (options.notStats) {
        return cb();
      }

      logger.debug("buildFormStatistics", {fileSizesByForm: fileSizesByForm});

      var startOfToday = new Date().setHours(0, 0, 0, 0);

      //If not getting all of the forms, do not populate statistics...
      if (!options.getAllForms) {
        return cb();
      }

      groups.getAppsForUser(connections, options.restrictToUser, function(err, allowedApps) {
        if (err) {
          return cb(err);
        }
        var submissionsTotalQuery = {"status": "complete"};
        var submissionsTodayQuery = {"status": "complete", "submissionCompletedTimestamp": {"$gte": startOfToday}};
        var appFormCountQuery = {};


        if (allowedApps) {
          submissionsTodayQuery.appId = {"$in": allowedApps};
          submissionsTotalQuery.appId = {"$in": allowedApps};
          appFormCountQuery.appId = {"$in": allowedApps};
        }


        async.each(foundAppForms, function(appForm, cb) {
          submissionsTotalQuery.formId = appForm._id;
          formStatistics[appForm._id] = {};
          formStatistics[appForm._id].appsUsingForm = 0;
          formStatistics[appForm._id].submissionsToday = 0;
          formStatistics[appForm._id].submissionsTotal = 0;

          //file storage stats if they exist
          var storageStats = _.find(fileSizesByForm, function(fileSizesByForm) {
            return fileSizesByForm._id.toString() === appForm._id.toString();
          }) || {};
          logger.debug("buildFormStatistics", {
            fileSizesByForm: fileSizesByForm,
            formId: appForm._id.toString(),
            storageStats: storageStats
          });
          formStatistics[appForm._id].submissionStorage = storageStats.value || 0;
          // [db-inspect] read from submissions db
          Submission.count(submissionsTotalQuery).exec(function(err, submissionsTotal) {
            if (err) {
              return cb(err);
            }

            formStatistics[appForm._id].submissionsTotal = submissionsTotal;
            submissionsTodayQuery.formId = appForm._id;
            // [db-inspect] read from submissions db
            Submission.count(submissionsTodayQuery).exec(function(err, submissionsToday) {
              if (err) {
                return cb(err);
              }

              formStatistics[appForm._id].submissionsToday = submissionsToday;
              appFormCountQuery.forms = appForm._id;

              AppForm.count(appFormCountQuery).exec(function(err, appsUsingForm) {
                if (err) {
                  return cb(err);
                }
                formStatistics[appForm._id].appsUsingForm = appsUsingForm;

                cb();
              });
            });
          });
        }, cb);
      });
    }

    function validateParams(cb) {
      var val = validate(options);

      //If the getAllForms parameter is set to true, then the appId will not be included.
      if (options.getAllForms === true) {
        return cb();
      }

      val.has("appId", function(failed) {
        if (failed) {
          return cb(new Error("Invalid parameters to getForms. No AppId Specified."));
        } else {
          return cb();
        }
      });
    }

    function getFormsForAppId(cb) {
      if (!options.getAllForms) {
        findAppForms(cb);
      } else {
        findAllForms(cb);
      }
    }

    function findAppForms(cb) {
      var restrictToUser = options.restrictToUser;
      var appid = options.appId;
      appforms.getAppFormsWithPopulatedForms(connections, restrictToUser, appid, function(err, forms) {
        if (forms !== null) {
          foundAppForms = forms;
        }
        return cb();
      });
    }

    function findAllForms(cb) {

      groups.getFormsForUser(connections, options.restrictToUser, function(err, allowedForms) {
        findForms(connections, allowedForms, function(err, forms) {

          if (err) {
            return cb(err);
          }

          if (forms !== null) {
            foundAppForms = forms;
          }

          return cb();
        });
      });
    }

    function constructResultJSON(cb) {
      var res = [];
      if (!foundAppForms) {
        resJSON = res;
        return cb();
      }

      foundAppForms = _.map(foundAppForms, function(foundAppForm) {
        var formEntry = {"_id": undefined, "formName": undefined, "lastUpdated": undefined, "description": ""};
        formEntry._id = foundAppForm._id;
        formEntry.name = foundAppForm.name;
        formEntry.lastUpdated = foundAppForm.lastUpdated.toUTCString();
        formEntry.lastUpdatedTimestamp = foundAppForm.lastUpdated.getTime();
        formEntry.updatedBy = foundAppForm.updatedBy;
        formEntry.createdBy = foundAppForm.createdBy || foundAppForm.updatedBy; //to allow for forms created before the addition of created by. When this form is updated a createdBy will be added
        formEntry.createdOn = foundAppForm.createdOn;


        //If there is a data refresh entry, then it should be compared to the last form definition refresh.
        if (foundAppForm.dataSources.lastRefresh) {
          formEntry.lastDataRefresh = misc.getMostRecentRefresh(formEntry.lastUpdated, foundAppForm.dataSources.lastRefresh);
        } else {
          formEntry.lastDataRefresh = formEntry.lastUpdated;
        }

        if (foundAppForm.description) {
          formEntry.description = foundAppForm.description;
        }

        if (options.getAllForms === true && !options.notStats) {
          formEntry.appsUsingForm = formStatistics[foundAppForm._id].appsUsingForm;
          formEntry.submissionsToday = formStatistics[foundAppForm._id].submissionsToday;
          formEntry.submissionsTotal = formStatistics[foundAppForm._id].submissionsTotal;
          formEntry.submissionStorage = formStatistics[foundAppForm._id].submissionStorage;
        }

        return formEntry;
      });

      resJSON = foundAppForms;
      return cb();
    }
  }

  return {
    getForms: getForms,
    findForms: findForms
  };
};
