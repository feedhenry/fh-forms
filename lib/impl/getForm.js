var models = require('../common/models.js')();
var validate = require('../common/validate.js');
var misc = require('../common/misc.js');
var async = require('async');
var groups = require('./groups.js');
var _ = require('underscore');
var logger = require('../common/logger').getLogger();

function _validateReturnedDataSources(formDataSourceIds, dataSources) {
  if (_.isNull(dataSources)) {
    return new Error("No Data Sources Found");
  }

  //Some form data sources are missing
  if (dataSources.length !== formDataSourceIds.length) {
    return new Error("Form Data Sources Missing");
  }

  var missingCacheEntries = _.filter(dataSources, function(dataSource) {
    return dataSource.cache.length === 0;
  });

  //Some Required Data Sources Have No Cache Entries
  if (missingCacheEntries.length > 0) {
    return new Error("No Field Data Available For Data Source " + _.first(missingCacheEntries).name);
  }

  var dsNoData = _.find(dataSources, function(dataSource) {
    return !dataSource.cache[0].data || dataSource.cache[0].data.length === 0;
  });

  //If a required Data Source does not have any data, then cannot get the form.
  if (dsNoData) {
    return new Error("No Data For Data Source " + dsNoData.name);
  }


  //All valid. No Errors
  return null;
}


var getForm = function(connections, options, cb) {
  async.waterfall([validateParams, getFormUsingId, populateFieldDataFromDataSources, constructResultJSON], function(err, resultJSON) {
    if (err) {
      return cb(misc.buildErrorResponse({
        error: err
      }));
    }
    return cb(err, resultJSON);
  });

  function validateParams(cb) {
    var paramsValidator = validate(options);

    if (!options.getAllForms) {
      paramsValidator.has("_id", function(failure) {
        if (failure) {
          return cb(new Error("Invalid params to getForm. FormId Not specified"));
        } else {
          return cb(undefined, options._id.toString());
        }
      });
    } else {
      return cb(undefined, null);
    }
  }
  // [db-inspect] calls to form and field dbs here. not sure about whether they are user or system
  function getFormUsingId(formId, cb) {
    var Form = models.get(connections.mongooseConnection, models.MODELNAMES.FORM);
    var Field = models.get(connections.mongooseConnection, models.MODELNAMES.FIELD);
    var query = {};

    groups.getFormsForUser(connections, options.restrictToUser, function(err, allowedForms) {
      if (err) {
        return cb(err);
      }

      if (!options.getAllForms) {      // single form requested
        query = {"_id": formId};
        if (allowedForms) {            // if this user is restricted
          if (allowedForms.indexOf(formId) < 0) {   // check if requested if in allowed list
            return cb(new Error("Not allowed access to that form: " + formId));
          }
        }
      } else if (options.getAllForms && allowedForms) {
        query._id = { $in: allowedForms};
      }

      Form.find(query).populate("pages", "-__v")
        .populate("pageRules", "-__v")
        .populate("fieldRules", "-__v")
        .populate("dataSources.formDataSources", "_id name lastUpdated createdBy updatedBy")//Populating Data Sources
        .populate("dataTargets", "_id name lastUpdated createdBy updatedBy")//Populating Data Targets
        .select("-__v").exec(function(err, formResults) {
          if (err) {
            return cb(err);
          }


          if ((formResults === null || formResults === undefined) && (!options.getAllForms)) {
            return cb(new Error("No form exists matching id " + options._id));
          }

          //Now have a form with all pages, pageRules and fieldRules populated
          Form.populate(formResults, {"path": "pages.fields", "model": Field, "select": "-__v"}, function(err, updatedForms) {
            if (err) {
              return cb(err);
            }



            //Switching to json as only reading
            updatedForms = _.map(updatedForms, function(updatedForm) {
              return updatedForm.toJSON();
            });

            logger.debug("getFormUsingId ", JSON.stringify(updatedForms));

            cb(undefined, updatedForms);
          });
        });
    });
  }

  /**
   * Extract a list of data sources from forms
   * @param forms
   */
  function getDataSourceIds(forms) {
    var dataSources = _.map(forms, function(form) {
      return _.map(form.dataSources.formDataSources, function(dataSourceMeta) {
        return dataSourceMeta._id.toString();
      });
    });

    dataSources = _.flatten(dataSources);

    //Only want unique data source Ids as multiple forms may use the same data source.

    return _.uniq(dataSources);
  }
  // [db-inspect] read from data sources db
  //Any fields that require data source data need to be populated
  function populateFieldDataFromDataSources(populatedForms, cb) {
    logger.debug("populateFieldDataFromDataSources", populatedForms);
    var DataSource = models.get(connections.mongooseConnection, models.MODELNAMES.DATA_SOURCE);
    //If no data source cache data is expected, then there is no need to load the Data Source Cache Data.

    if (!options.expectDataSourceCache) {
      return cb(undefined, populatedForms);
    }
    var dataSourceIds = getDataSourceIds(populatedForms);

    logger.debug("populateFieldDataFromDataSources", {dataSourceIds: dataSourceIds});

    //If none of the forms refer to any data sources, then no need to search
    if (dataSourceIds.length === 0) {
      return cb(undefined, populatedForms);
    }

    var query = {
      _id: {
        "$in": dataSourceIds
      }
    };

    //One query to populate all data sources
    DataSource.find(query).exec(function(err, dataSources) {
      if (err) {
        logger.error("Error Finding Data Sources", {error: err, dataSourceIds:dataSourceIds});
        return cb(err);
      }

      logger.debug("populateFieldDataFromDataSources", {dataSources: dataSources});

      var validatonError = _validateReturnedDataSources(dataSourceIds, dataSources);

      if (validatonError) {
        logger.error("Error Getting Form With Data Sources", {error: validatonError});
        return cb(validatonError);
      }

      var cacheEntries = {};

      //Assigning a lookup for cache entries
      _.each(dataSources, function(dataSource) {
        cacheEntries[dataSource._id] = dataSource.cache[0].data;
      });

      //Overriding field options for a field with data source data if the field is defined as being sourced from a data source.
      populatedForms = _.map(populatedForms, function(populatedForm) {
        populatedForm.pages = _.map(populatedForm.pages, function(page) {
          page.fields =  _.map(page.fields, function(field) {
            //If it is a data source type field, then return the data source data
            if (field.dataSourceType === models.FORM_CONSTANTS.DATA_SOURCE_TYPE_DATA_SOURCE) {
              //No guarantee these are set
              field.fieldOptions = field.fieldOptions || {};
              field.fieldOptions.definition = field.fieldOptions.definition || {};

              //Setting the data source data
              field.fieldOptions.definition.options = models.convertDSCacheToFieldOptions(field.type, cacheEntries[field.dataSource]);
            }
            return field;
          });
          return page;
        });

        return populatedForm;
      });

      logger.debug("populateFieldDataFromDataSources", {populatedForms: JSON.stringify(populatedForms)});

      //Finished, return the merged forms
      return cb(undefined, populatedForms);
    });

  }

  function constructResultJSON(formsJSON, cb) {
    var resultJSON;

    if (!options.getAllForms) {
      if (formsJSON.length === 0) {
        return cb(null, null);
      }
      if (formsJSON.length !== 1) {
        return cb(new Error("Invalid number of forms returned " + formsJSON.length));
      }
    } else {
      resultJSON = {"forms" : []};
    }

    formsJSON = _.map(formsJSON, function(formJSON) {
      //Removing form data source information.
      function pruneDataSourceInfo(form) {
        if (options.includeDataSources) {
          return form;
        }

        delete form.dataSources;

        form.pages = _.map(form.pages, function(page) {
          page.fields = _.map(page.fields, function(field) {
            delete field.dataSource;
            delete field.dataSourceType;
            return field;
          });

          return page;
        });

        return form;
      }

      /**
       * If not showing admin fields, prune them out.
       */
      formJSON = misc.pruneAdminFields(options, formJSON);

      if (options.export) {
        formJSON = misc.pruneIds(formJSON);
      }


      formJSON.lastDataRefresh = misc.getMostRecentRefresh(formJSON.lastUpdated, formJSON.dataSources.lastDataRefresh);

      formJSON = pruneDataSourceInfo(formJSON);

      if (!options.export) {
        var generatedRefs = misc.generatePageAndFieldRefs(formJSON);
        var pageRef = generatedRefs.pageRef;
        var fieldRef = generatedRefs.fieldRef;
        formJSON.pageRef = pageRef;
        formJSON.fieldRef = fieldRef;
        formJSON.lastUpdatedTimestamp = formJSON.lastUpdated.getTime();
      }

      return formJSON;
    });

    if (!options.getAllForms) {
      resultJSON = formsJSON[0];
    } else {
      resultJSON.forms = formsJSON;
    }

    return cb(undefined, resultJSON);
  }

};

module.exports = getForm;
