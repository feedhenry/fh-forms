var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var CONSTANTS = require('../constants');
var submissionCommentSchema = require('./submissionComment');
//Pagination support as the server can have 1000's of submissions.
var mongoosePaginate = require('mongoose-paginate');

module.exports = function() {
  var formFieldsSchema = new Schema({
    "fieldId": { type: Schema.Types.ObjectId, ref: CONSTANTS.MODELNAMES.FIELD},
    "fieldValues": Schema.Types.Mixed,
    "sectionIndex": {type: Number}
  }, {_id : false});

  var formSubmissionSchema = new Schema({
    "submissionCompletedTimestamp": {"type": Date, default: 0, required: true, index: true},
    "updatedBy": {type: String},
    "updatedTimestamp": {"type": Date, default: Date.now},
    "metaData": {type: Schema.Types.Mixed},
    "timezoneOffset" : {"type" : Number, required: true},
    "appId": {type: String, required: true},
    "appClientId": {type: String, required: true},
    "appCloudName": {type: String, required: true},
    "appEnvironment": {type: String, required: true},
    "formSubmittedAgainst":{type: Object, required: false},
    "formId": { type: Schema.Types.ObjectId, ref: CONSTANTS.MODELNAMES.FORM , required: true, index: true},
    "userId": {type: String, required: false},
    "deviceId": {type: String, required: true},
    "deviceIPAddress": {type: String, required: true},
    "submissionStartedTimestamp": {type : Date, default : Date.now, required: true, index: true},
    "status": {type: String, enum: [CONSTANTS.SUBMISSION_STATUS.PENDING, CONSTANTS.SUBMISSION_STATUS.COMPLETE, CONSTANTS.SUBMISSION_STATUS.ERROR],  required:true, default: "pending", index: true},
    "deviceFormTimestamp": {type: Date, required: true},
    "masterFormTimestamp": {type: Date, required: true},
    "comments": [submissionCommentSchema()],
    "formFields": [formFieldsSchema]
  }, CONSTANTS.SCHEMA_OPTIONS);

  formSubmissionSchema.pre('save', function(next) {
    var newTimestamp = Date.now();
    this.updatedTimestamp = newTimestamp;
    next();
  });

  //Adding pagination plugin
  formSubmissionSchema.plugin(mongoosePaginate);

  return formSubmissionSchema;
};
