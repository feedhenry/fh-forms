var logger = require('../common/logger.js').getLogger();

var HOST_PLACEHOLDER = "--#host#--";

/**
 * Build All Of The Params Needed To Send Submission Email Notifications
 * @param connections
 * @param completeStatus
 * @param cb
 */
exports.buildNotificationParams = function sendNotification(connections, completeStatus, cb) {
  var options = {_id: completeStatus.formSubmission.formId};

  require('./getNotifications.js')(connections, options, function(err, subscribers) {
    if (err) {
      return cb(err);
    }

    var msg = {};

    logger.trace('sendNotification() - subscribers: ', subscribers);
    if (subscribers && subscribers.subscribers && subscribers.subscribers.length > 0) {
      var addresses = subscribers.subscribers.join(',');
      msg = buildSubmissionReceivedMessage(addresses, subscribers.formName, completeStatus.formSubmission);
      logger.debug('sending submission notification message to: ' + addresses + ', for submissionid: ' + msg.formId);
      logger.trace('submission notification for submissionid: ' + msg.formId + ', message: ' + JSON.stringify(msg));
    }

    return cb(undefined, msg);
  });
};

function getField(id, formSubmission) {
  var result;
  formSubmission.formSubmittedAgainst.pages.forEach(function(page) {
    page.fields.forEach(function(field) {
      if (field._id === id) {
        result = field;
      }
    });
  });
  return result;
}

function getFieldMsg(formField, formSubmission) {
  var subField = "";
  subField = formField.fieldId.name + ": ";
  for (var j=0; j<formField.fieldValues.length; j += 1) {
    if (j!==0) {
      subField += ", ";
    }
    subField += getStringValue(formField.fieldValues[j], formField.fieldId.type, formSubmission);
  }
  return subField;
}

function getStructuredFields(formSubmission, fieldPageMap, fieldSectionMap) {
  var pages = {};
  formSubmission.formFields.forEach(function(formField) {
    var fieldId = formField.fieldId._id || formField.fieldId;
    var pageId = fieldPageMap[fieldId];
    var sectionId = fieldSectionMap[fieldId];
    pages[pageId] = pages[pageId] || {};
    pages[pageId][sectionId] = pages[pageId][sectionId] || [];
    var sectionIndex = formField.sectionIndex || 0;
    pages[pageId][sectionId][sectionIndex] = pages[pageId][sectionId][sectionIndex] || [];
    pages[pageId][sectionId][sectionIndex].push(formField);
  });
  return pages;
}

exports.buildSubmissionReceivedMessage = buildSubmissionReceivedMessage; // export for tests
function buildSubmissionReceivedMessage(subscribers, formName, formSubmission) {
  var msg = {};
  msg.subscribers = subscribers;
  msg.formId = formSubmission.formId;
  msg.appId = formSubmission.appId;
  msg.attachmentUrl = getAttachmentUrl(formSubmission);
  msg.formName = formName || "UNKNOWN FORM NAME";
  msg.submissionStatus = formSubmission.status;
  msg.appEnvironment = formSubmission.appEnvironment;
  msg.submissionStarted = formSubmission.submissionStartedTimestamp;
  msg.submissionCompleted = formSubmission.submissionCompletedTimestamp;
  msg.submissionId = formSubmission._id;
  msg.deviceIPAddress = formSubmission.deviceIPAddress;
  msg.deviceId = formSubmission.deviceId;
  msg.submittedFields = [];

  var form = formSubmission.formSubmittedAgainst;

  // build helper structures
  var fieldPageMap = {};
  var fieldSectionMap = {};
  var sectionsInPage = {};
  form.pages.forEach(function(page) {
    var currentSectionId = 'initial';
    sectionsInPage[page._id] = [currentSectionId];
    page.fields.forEach(function(field) {
      fieldPageMap[field._id] = page._id;
      if (field.type === 'sectionBreak') {
        currentSectionId = field._id;
        sectionsInPage[page._id].push(currentSectionId);
      } else {
        fieldSectionMap[field._id] = currentSectionId;
      }
    });
  });

  // get structured form fields
  var pages = getStructuredFields(formSubmission, fieldPageMap, fieldSectionMap);

  // construct message
  form.pages.forEach(function(page) {
    //is this page in submission?
    if (pages[page._id]) {
      var sections = sectionsInPage[page._id];
      sections.forEach(function(section) {
        var repSections = pages[page._id][section];
        if (repSections) {
          if (repSections.length === 1) {
            repSections[0].forEach(function(formField) {
              msg.submittedFields.push(getFieldMsg(formField, formSubmission));
            });
          } else {
            repSections.forEach(function(repSection, index) {
              msg.submittedFields.push(getField(section, formSubmission).name + ' - ' + (index + 1) + ':');
              repSection.forEach(function(formField) {
                msg.submittedFields.push(getFieldMsg(formField, formSubmission));
              });
            });
          }
        }
      });
    }
  });

  return msg;
}

function getAttachmentUrl(formSubmission) {
  return HOST_PLACEHOLDER + '/api/v2/mbaas/' + formSubmission.appEnvironment + '/appforms/submissions/' + formSubmission._id + '/exportpdf';
}

function getStringValue(valueObj, type, formSubmission) {
  // if photo/file/sig return URL
  if (["photo", "signature", "file"].indexOf(type) >= 0) {
    return HOST_PLACEHOLDER + "/api/v2/mbaas/" + formSubmission.appEnvironment + "/appforms/submissions/" + formSubmission._id + "/files/" + valueObj.groupId;
  }

  if ("checkboxes" === type) {
    if (valueObj.selections) {
      return "(" + valueObj.selections.join(',') + ")";
    } else {
      return "()";
    }
  }

  if (["location", "locationMap"].indexOf(type) >= 0) {
    if (valueObj.lat) {
      return "(" + valueObj.lat + ',' + valueObj.long + ")";
    } else if (valueObj.zone) {
      return "(" + valueObj.zone + ' ' + valueObj.eastings + ', ' + valueObj.northings + ")";
    } else {
      return JSON.stringify(valueObj);
    }
  }

  if ("object" === typeof valueObj) {  // should only be strings left at this point, leaving this here to catch newly added field types in the future
    return JSON.stringify(valueObj);
  }

  // TODO if checkbox return selections
  return valueObj.toString();
}
