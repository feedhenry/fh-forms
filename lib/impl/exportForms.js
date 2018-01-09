'use strict';

var models = require('../common/models.js')()
  , archiver = require('archiver')
  , _ = require('underscore')
  , async = require('async')
  , path = require('path');

var METADATA_FILE_NAME = "metadata.json";
var ZIP_SUBFOLDER_NAME = "forms";

// Push a new entry into the metadata `files` list
function updateMetadata(metadata, form) {
  metadata.files[form.id] = {
    name: form.name,
    path: path.join(ZIP_SUBFOLDER_NAME, form.id + '.json')
  };
}

/**
 * Creates a zip stream and returns it in the callback. The zip archive that
 * is created will contain a metadata.json file and a subfolder `ZIP_SUBFOLDER_NAME`
 * where all the forms will be written to.
 *
 * @param forms A collection of fully populated form objects
 * @param callback Invoked with the zip stream
 */
function writeFormsToZip(forms, callback) {
  var zip = archiver('zip')
    , metadata = {};

  metadata.exportCreated = new Date();
  metadata.files = {};

  function processForms() {
    // Process all forms
    _.each(forms, function(form) {
      // Update metadata on the fly
      updateMetadata(metadata, form);
      zip.append(JSON.stringify(form), {
        name: path.join(ZIP_SUBFOLDER_NAME, form.id + '.json')
      });
    });

    // Last step: write the metadata file in the root folder
    zip.append(JSON.stringify(metadata), {
      name: METADATA_FILE_NAME
    });

    zip.finalize();
  }

  process.nextTick(processForms);
  callback(null, zip);
}

/**
 * Entry point for forms export. Fetches all forms from MongoDB,
 * populates them and passes them to `writeFormsToZip` to create the
 * archive.
 *
 * @param connectionOptions injected by middleware
 * @param callback Invoked with the zip stream
 */
// [db-inspect] read from forms db
module.exports = function(connectionOptions, callback) {
  var Forms = models.get(connectionOptions.mongooseConnection, models.MODELNAMES.FORM)
    , Field = models.get(connectionOptions.mongooseConnection, models.MODELNAMES.FIELD);

  async.waterfall([
    // First find all forms and populate properties
    function(cb) {
      Forms.find({})
        .populate("pages")
        .populate("pageRules")
        .populate("fieldRules")
        .exec(cb);
    },

    // Fields have to be populated separately
    function(forms, cb) {
      Forms.populate(forms, {
        "path": "pages.fields",
        "model": Field
      }, cb);
    }
  ], function(err, forms) {
    if (err) {
      console.error("Error fetching forms from database", {error: err});
      return callback(err);
    }

    writeFormsToZip(forms, callback);
  });
};
