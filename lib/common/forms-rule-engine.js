(function() {

  var async = require('async');
  var _ = require('underscore');
  var moment = require('moment');
  var getSectionMap = require('../utils/get-section-map');

  /*
   * Sample Usage
   *
   * var engine = formsRulesEngine(form-definition);
   *
   * engine.validateForms(form-submission, function(err, res) {});
   *      res:
   *      {
   *          "validation": {
   *              "fieldId": {
   *                  "fieldId": "",
   *                  "valid": true,
   *                  "errorMessages": [
   *                      "length should be 3 to 5",
   *                      "should not contain dammit",
   *                      "should repeat at least 2 times"
   *                  ]
   *              },
   *              "fieldId1": {
   *
   *              }
   *          }
   *      }
   *
   *
   * engine.validateField(fieldId, submissionJSON, function(err,res) {});
   *      // validate only field values on validation (no rules, no repeat checking)
   *      res:
   *      "validation":{
   *              "fieldId":{
   *                  "fieldId":"",
   *                  "valid":true,
   *                  "errorMessages":[
   *                      "length should be 3 to 5",
   *                      "should not contain dammit"
   *                  ]
   *              }
   *          }
   *
   * engine.checkRules(submissionJSON, unction(err, res) {})
   *      // check all rules actions
   *      res:
   *      {
   *          "actions": {
   *              "pages": {
   *                  "targetId": {
   *                      "targetId": "",
   *                      "action": "show|hide"
   *                  }
   *              },
   *              "fields": {
   *
   *              }
   *          }
   *      }
   *
   */

  var FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY = "date";
  var FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY = "time";
  var FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME = "datetime";

  var formsRulesEngine = function(formDef) {
    var initialised;

    var definition = formDef;
    var submission;

    var fieldMap = {};
    var adminFieldMap ={}; //Admin fields should not be part of a submission
    var requiredFieldMap = {};
    var submissionRequiredFieldsMap = {}; // map to hold the status of the required fields per submission
    var fieldRulePredicateMap = {};
    var fieldRuleSubjectMap = {};
    var pageRulePredicateMap = {};
    var pageRuleSubjectMap = {};
    var submissionFieldsMap = {};

    //Mapping fieldId to their section Ids if a field is contained in a section
    var fieldSectionMapping = {};

    var validatorsMap = {
      "text": validatorString,
      "textarea": validatorString,
      "number": validatorNumericString,
      "emailAddress": validatorEmail,
      "dropdown": validatorDropDown,
      "radio": validatorRadio,
      "checkboxes": validatorCheckboxes,
      "location": validatorLocation,
      "locationMap": validatorLocationMap,
      "photo": validatorFile,
      "signature": validatorFile,
      "file": validatorFile,
      "dateTime": validatorDateTime,
      "url": validatorString,
      "sectionBreak": validatorSection,
      "barcode": validatorBarcode,
      "sliderNumber": validatorNumericString,
      "readOnly": function() {
        //readonly fields need no validation. Values are ignored.
        return true;
      }
    };

    var validatorsClientMap = {
      "text": validatorString,
      "textarea": validatorString,
      "number": validatorNumericString,
      "emailAddress": validatorEmail,
      "dropdown": validatorDropDown,
      "radio": validatorRadio,
      "checkboxes": validatorCheckboxes,
      "location": validatorLocation,
      "locationMap": validatorLocationMap,
      "photo": validatorAnyFile,
      "signature": validatorAnyFile,
      "file": validatorAnyFile,
      "dateTime": validatorDateTime,
      "url": validatorString,
      "sectionBreak": validatorSection,
      "barcode": validatorBarcode,
      "sliderNumber": validatorNumericString,
      "readOnly": function() {
        //readonly fields need no validation. Values are ignored.
        return true;
      }
    };

    var fieldValueComparison = {
      "text": function(fieldValue, testValue, condition) {
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "textarea": function(fieldValue, testValue, condition) {
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "number": function(fieldValue, testValue, condition) {
        return this.numericalComparison(fieldValue, testValue, condition);
      },
      "emailAddress": function(fieldValue, testValue, condition) {
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "dropdown": function(fieldValue, testValue, condition) {
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "radio": function(fieldValue, testValue, condition) {
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "checkboxes": function(fieldValue, testValue, condition) {
        fieldValue = fieldValue || {};
        var valueFound = false;

        if (!(fieldValue.selections instanceof Array)) {
          return false;
        }

        //Check if the testValue is contained in the selections
        for (var selectionIndex = 0; selectionIndex < fieldValue.selections.length; selectionIndex++ ) {
          var selectionValue = fieldValue.selections[selectionIndex];
          //Note, here we are using the "is" string comparator to check if the testValue matches the current selectionValue
          if (this.comparisonString(selectionValue, testValue, "is")) {
            valueFound = true;
          }
        }

        if (condition === "is") {
          return valueFound;
        } else {
          return !valueFound;
        }

      },
      "dateTime": function(fieldValue, testValue, condition, fieldOptions) {
        var valid = false;

        fieldOptions = fieldOptions || {definition: {}};

        //dateNumVal is assigned an easily comparable number depending on the type of units used.
        var dateNumVal = null;
        var testNumVal = null;

        switch (fieldOptions.definition.datetimeUnit) {
        case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:
          try {
            dateNumVal = new Date(new Date(fieldValue).toDateString()).getTime();
            testNumVal = new Date(new Date(testValue).toDateString()).getTime();
            valid = true;
          } catch (e) {
            dateNumVal = null;
            testNumVal = null;
            valid = false;
          }
          break;
        case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:
          var cvtTime = this.cvtTimeToSeconds(fieldValue);
          var cvtTestVal = this.cvtTimeToSeconds(testValue);
          dateNumVal = cvtTime.seconds;
          testNumVal = cvtTestVal.seconds;
          valid = cvtTime.valid && cvtTestVal.valid;
          break;
        case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
          try {
            dateNumVal = (new Date(fieldValue).getTime());
            testNumVal = (new Date(testValue).getTime());
            valid = true;
          } catch (e) {
            valid = false;
          }
          break;
        default:
          valid = false;
          break;
        }

        //The value is not valid, no point in comparing.
        if (!valid) {
          return false;
        }

        if ("is at" === condition) {
          valid = dateNumVal === testNumVal;
        } else if ("is before" === condition) {
          valid = dateNumVal < testNumVal;
        } else if ("is after" === condition) {
          valid = dateNumVal > testNumVal;
        } else {
          valid = false;
        }

        return valid;
      },
      "url": function(fieldValue, testValue, condition) {
        return this.comparisonString(fieldValue, testValue, condition);
      },
      "barcode": function(fieldValue, testValue, condition) {
        fieldValue = fieldValue || {};

        if (typeof(fieldValue.text) !== "string") {
          return false;
        }

        return this.comparisonString(fieldValue.text, testValue, condition);
      },
      "sliderNumber": function(fieldValue, testValue, condition) {
        return this.numericalComparison(fieldValue, testValue, condition);
      },
      "comparisonString": function(fieldValue, testValue, condition) {
        var valid = true;

        if ("is" === condition) {
          valid = fieldValue === testValue;
        } else if ("is not" === condition) {
          valid = fieldValue !== testValue;
        } else if ("contains" === condition) {
          valid = fieldValue.indexOf(testValue) !== -1;
        } else if ("does not contain" === condition) {
          valid = fieldValue.indexOf(testValue) === -1;
        } else if ("begins with" === condition) {
          valid = fieldValue.substring(0, testValue.length) === testValue;
        } else if ("ends with" === condition) {
          valid = fieldValue.substring(Math.max(0, (fieldValue.length - testValue.length)), fieldValue.length) === testValue;
        } else {
          valid = false;
        }

        return valid;
      },
      "numericalComparison": function(fieldValue, testValue, condition) {
        var fieldValNum = parseInt(fieldValue, 10);
        var testValNum = parseInt(testValue, 10);

        if (isNaN(fieldValNum) || isNaN(testValNum)) {
          return false;
        }

        if ("is equal to" === condition) {
          return fieldValNum === testValNum;
        } else if ("is less than" === condition) {
          return fieldValNum < testValNum;
        } else if ("is greater than" === condition) {
          return fieldValNum > testValNum;
        } else {
          return false;
        }
      },
      "cvtTimeToSeconds": function(fieldValue) {
        var valid = false;
        var seconds = 0;
        if (typeof fieldValue === "string") {
          var parts = fieldValue.split(':');
          valid = (parts.length === 2) || (parts.length === 3);
          if (valid) {
            valid = isNumberBetween(parts[0], 0, 23);
            seconds += (parseInt(parts[0], 10) * 60 * 60);
          }
          if (valid) {
            valid = isNumberBetween(parts[1], 0, 59);
            seconds += (parseInt(parts[1], 10) * 60);
          }
          if (valid && (parts.length === 3)) {
            valid = isNumberBetween(parts[2], 0, 59);
            seconds += parseInt(parts[2], 10);
          }
        }
        return {valid: valid, seconds: seconds};
      }
    };



    var isFieldRuleSubject = function(fieldId) {
      return !!fieldRuleSubjectMap[fieldId];
    };

    var isPageRuleSubject = function(pageId) {
      return !!pageRuleSubjectMap[pageId];
    };

    /**
     *
     * Builds two field maps, both indexed by the field ID.
     *
     * - One for all of the fields (fieldMap)
     * - One for just the required fields (requiredFieldMap)
     *
     */
    function buildFieldMap() {
      // Iterate over all fields in form definition & build fieldMap
      _.each(definition.pages, function(page) {
        _.each(page.fields, function(field) {
          field.pageId = page._id;

          /**
           * If the field is an admin field, then it is not considered part of validation for a submission.
           */
          if (field.adminOnly) {
            adminFieldMap[field._id] = field;
            return;
          }

          field.fieldOptions = field.fieldOptions ? field.fieldOptions : {};
          field.fieldOptions.definition = field.fieldOptions.definition ? field.fieldOptions.definition : {};
          field.fieldOptions.validation = field.fieldOptions.validation ? field.fieldOptions.validation : {};

          fieldMap[field._id] = field;

          //Section/Page Breaks are not considered to be required as they are
          //structural fields only
          if (field.required && field.type !== "sectionBreak" && field.type !== "pageBreak") {
            requiredFieldMap[field._id] = {
              field: field,
              //Validation details for each section index
              sections: {},
              validated: false,
              valueRequired: field.required
            };
          }

        });
      });
    }

    /**
     *
     * Building a map of all of the field targets of different field rules.
     *
     * This makes it easier to check if any field is the target of a field rule.
     *
     */
    function buildFieldRuleMaps() {
      // Iterate over all rules in form definition & build ruleSubjectMap
      _.each(definition.fieldRules, function(rule) {
        _.each(rule.ruleConditionalStatements, function(ruleConditionalStatement) {
          var fieldId = ruleConditionalStatement.sourceField;
          fieldRulePredicateMap[fieldId] = fieldRulePredicateMap[fieldId] || [];
          fieldRulePredicateMap[fieldId].push(rule);
        });
        /**
         * Target fields are an array of fieldIds that can be targeted by a field rule
         * To maintain backwards compatibility, the case where the targetPage is not an array has to be considered
         * @type {*|Array}
         */
        if (_.isArray(rule.targetField)) {
          _.each(rule.targetField, function(targetField) {
            fieldRuleSubjectMap[targetField] = fieldRuleSubjectMap[targetField] || [];
            fieldRuleSubjectMap[targetField].push(rule);
          });
        } else {
          fieldRuleSubjectMap[rule.targetField] = fieldRuleSubjectMap[rule.targetField] || [];
          fieldRuleSubjectMap[rule.targetField].push(rule);
        }
      });
    }

    /**
     *
     * Building a map of all of the page targets of different page rules.
     *
     * This makes it easier to check if any page is the target of a page rule.
     *
     */
    function buildPageRuleMap() {
      // Iterate over all rules in form definition & build ruleSubjectMap
      _.each(definition.pageRules, function(rule) {
        _.each(rule.ruleConditionalStatements, function(ruleConditionalStatement) {
          var fieldId = ruleConditionalStatement.sourceField;
          pageRulePredicateMap[fieldId] = pageRulePredicateMap[fieldId] || [];
          pageRulePredicateMap[fieldId].push(rule);
        });

        /**
         * Target pages are an array of pageIds that can be targeted by a page rule
         * To maintain backwards compatibility, the case where the targetPage is not an array has to be considered
         * @type {*|Array}
         */
        if (_.isArray(rule.targetPage)) {
          _.each(rule.targetPage, function(targetPage) {
            pageRuleSubjectMap[targetPage] = pageRuleSubjectMap[targetPage] || [];
            pageRuleSubjectMap[targetPage].push(rule);
          });
        } else {
          pageRuleSubjectMap[rule.targetPage] = pageRuleSubjectMap[rule.targetPage] || [];
          pageRuleSubjectMap[rule.targetPage].push(rule);
        }
      });
    }

    /**
     *
     * Building an index of all of the values made for the submission
     *
     * @returns {*}
     */
    function buildSubmissionFieldsMap() {
      submissionRequiredFieldsMap = JSON.parse(JSON.stringify(requiredFieldMap)); // clone the map for use with this submission
      submissionFieldsMap = {}; // start with empty map, rulesEngine can be called with multiple submissions
      var error;

      // iterate over all the fields in the submissions and build a map for easier lookup
      _.each(submission.formFields, function(formField) {
        if (!formField.fieldId) {
          error = new Error("No fieldId in this submission entry: " + JSON.stringify(formField));
          return;
        }

        //The section index should be part of the field input, however for backwards compatibility, it should
        //default to 0
        formField.sectionIndex = formField.sectionIndex || 0;

        /**
         * If the field passed in a submission is an admin field, then return an error.
         */
        if (adminFieldMap[formField.fieldId]) {
          error = "Submission " + formField.fieldId + " is an admin field. Admin fields cannot be passed to the rules engine.";
          return;
        }

        //Including the section index the the submission field map. Otherwise submissions with the same field ID but different
        //section Indexes would overwrite eachother.
        //This also has an impact when considering the rules. If a rule sources its value from a field in a repeating section and targets a
        //value in the same section, then the value has to come from the same section index.
        submissionFieldsMap[formField.fieldId] = submissionFieldsMap[formField.fieldId] || {};
        submissionFieldsMap[formField.fieldId][formField.sectionIndex] = formField;
      });
      return error;
    }

    /**
     *
     * Initialising the rules engine for a single form.
     *
     * This builds up the metadata required to process all rules.
     *
     */
    function init() {
      if (initialised) {
        return;
      }
      buildSectionMap();
      buildFieldMap();
      buildFieldRuleMaps();
      buildPageRuleMap();

      initialised = true;
    }

    /**
     *
     * Processing a single
     *
     * @param {Object} formSubmission - The full JSON definition of the form.
     * @returns {*}
     */
    function initSubmission(formSubmission) {

      //Ensuring that the form metadata has been initialised first.
      init();

      submission = formSubmission;
      return buildSubmissionFieldsMap();
    }

    /**
     *
     * Getting all of the fields that are in a section
     *
     * @param {string} sectionId
     */
    function getSectionFields(sectionId) {
      var allSectionFields = _.map(fieldSectionMapping, function(_sectionId, fieldId) {
        return sectionId === _sectionId ? fieldMap[fieldId] : null;
      });

      return _.compact(allSectionFields);
    }

    /**
     *
     * Checking for too many repeating sections passed.
     *
     * @param {object} validationResponse - The full validation response to update
     * @param {function} callback - Used because it is part of an async.waterfall in the validateForm function
     */
    function checkForTooManyRepeatingSections(validationResponse, callback) {
      var repeatingSections = getAllRepeatingSections();

      //For each of the repeating sections, check that no values have been submitted with an index too large.
      _.each(repeatingSections, function(repeatingSection) {
        var maxRepeat = getSectionMaxRepeat(repeatingSection._id);

        //All of the fields assigned to the repeating section
        var allSectionFields = getSectionFields(repeatingSection._id);

        //For each of these fields, check that there isn't a section index larger than the max number of section repetitions
        _.each(allSectionFields, function(sectionField) {
          var invalidFieldValues = _.filter(submissionFieldsMap[sectionField._id], function(sectionValues, sectionIndex) {
            return parseInt(sectionIndex) >= maxRepeat;
          });

          //For each of the invalid field entries, assign the correct messages
          return _.each(invalidFieldValues, function(invalidFieldValue) {
            var resField = {};
            resField.fieldId = invalidFieldValue.fieldId;
            resField.valid = false;
            resField.fieldErrorMessage = ["Expected a maximum of " + maxRepeat + " sections but got " + (invalidFieldValue.sectionIndex + 1) + "."];
            resField.sectionId = fieldSectionMapping[invalidFieldValue.fieldId];
            resField.sectionIndex = invalidFieldValue.sectionIndex;

            assignValidationResponse(repeatingSection._id, invalidFieldValue.sectionIndex, validationResponse.validation, resField);
            validationResponse.validation.valid = false;
          });
        });
      });

      callback(undefined, validationResponse);
    }

    /**
     *
     * Getting previous values for a single field from a previous submission
     *
     * @param {object} submittedField - The field submitted
     * @param {object|null} previousSubmission - Full JSON definition of the previous submission to get the values from
     * @param {function} cb
     * @returns {*}
     */
    function getPreviousFieldValues(submittedField, previousSubmission, cb) {
      if (previousSubmission && previousSubmission.formFields) {
        async.filter(previousSubmission.formFields, function(formField, cb) {
          return cb(formField.fieldId.toString() === submittedField.fieldId.toString());
        }, function(results) {
          var previousFieldValues = null;
          if (results && results[0] && results[0].fieldValues) {
            previousFieldValues = results[0].fieldValues;
          }
          return cb(undefined, previousFieldValues);
        });
      } else {
        return cb();
      }
    }

    /**
     *
     * Validating a full submission against a form definition
     *
     * @param {object} submission - The full JSON definition of the submission.
     * @param {object} [previousSubmission] - Optional previous submission if values need to be compared.
     * @param {function} cb
     * @returns {*}
     */
    function validateForm(submission, previousSubmission, cb) {
      if ("function" === typeof previousSubmission) {
        cb = previousSubmission;
        previousSubmission = null;
      }

      //Ensuring the form metadata is initialised
      init();

      //Initialising the submission metatadata for validation
      var err = initSubmission(submission);
      if (err) {
        return cb(err);
      }

      //All of the steps required to validate the submission against the form definition
      async.waterfall([
        function(cb) {
          var response = {
            validation: {
              valid: true
            }
          };

          //First, validate each of the fields in the passed submission
          validateSubmittedFields(response, previousSubmission, cb);
        },
        //Now check if any required fields were not submitted
        checkIfRequiredFieldsNotSubmitted,
        //Now check if too many repeating section field values were passed for any repeating section
        checkForTooManyRepeatingSections
      ], function(err, results) {
        if (err) {
          return cb(err);
        }

        return cb(undefined, results);
      });
    }

    /**
     *
     * Validating the submitted fields for a single submission
     *
     * @param {object} validationResponse - The full validation response
     * @param {object|null} previousSubmission - A previous submission to compare against
     * @param {function} cb
     */
    function validateSubmittedFields(validationResponse, previousSubmission, cb) {

      // for each field, validate that the submitted values are valid
      async.each(submission.formFields, function(submittedField, callback) {
        var fieldID = submittedField.fieldId;
        var fieldDef = fieldMap[fieldID];

        //The section index is used to ensure that comparisons are made against the correct section index.
        //This is used when comparing rule source field values targeting fields in the same section
        //It is also used when assigning error messages to the validationResponse
        var sectionIndex = submittedField.sectionIndex || 0;

        getPreviousFieldValues(submittedField, previousSubmission, function(err, previousFieldValues) {
          if (err) {
            return callback(err);
          }

          //Validing the submitted field against the field definition
          getFieldValidationStatus(submittedField, fieldDef, previousFieldValues, function(err, fieldRes) {
            if (err) {
              return callback(err);
            }

            if (!fieldRes.valid) {
              validationResponse.validation.valid = false; // indicate invalid form if any fields invalid
              assignValidationResponse(fieldID, sectionIndex, validationResponse.validation, fieldRes);
            }

            return callback();
          });
        });
      }, function(err) {
        return cb(err, validationResponse);
      });
    }

    /**
     *
     * Building a map of all of the sections along with the fields contained in them
     *
     */
    function buildSectionMap() {
      fieldSectionMapping = getSectionMap(definition);
    }

    /**
     *
     * Assiging a field validation response to the correct section index
     *
     * @param {string} fieldId
     * @param {number} sectionIndex
     * @param {object} globalValidationResponse
     * @param {object} fieldValidationResponse
     */
    function assignValidationResponse(fieldId, sectionIndex, globalValidationResponse, fieldValidationResponse) {
      globalValidationResponse[fieldId] = globalValidationResponse[fieldId] || {sections: {}};
      globalValidationResponse[fieldId].sections[sectionIndex] = fieldValidationResponse;

      //For backwards compatiblility, the section 0 validation response is assigned field validation response
      if (sectionIndex === 0) {
        _.defaults(globalValidationResponse[fieldId], globalValidationResponse[fieldId].sections[0]);
      }
    }

    /**
     *
     * Getting the minimum number of repetitions for a field in a repeating section
     *
     * @param fieldId
     * @returns {number}
     */
    function getSectionMinRepeat(fieldId) {
      //If the field is in a repeating section, need to check each repeating section
      var sectionId = fieldSectionMapping[fieldId];
      var section = sectionId ? fieldMap[sectionId] : null;

      //The field is in a repeating section.
      return section && section.repeating && section.fieldOptions.definition.minRepeat ? section.fieldOptions.definition.minRepeat : 1;
    }

    /**
     *
     * Getting all repeating sections belonging to this form.
     *
     * @returns {Array}
     */
    function getAllRepeatingSections() {
      return _.filter(fieldMap, function(field) {
        return field.type === "sectionBreak" && field.fieldOptions && field.fieldOptions.definition && field.fieldOptions.definition.maxRepeat;
      });
    }

    /**
     *
     * Getting the maximum number of times that a section can repeat.
     *
     * @param {string} sectionId
     * @returns {number} - the number of times a section repeats.
     */
    function getSectionMaxRepeat(sectionId) {
      var section = fieldMap[sectionId];

      return section && section.repeating && section.fieldOptions.definition.maxRepeat ? section.fieldOptions.definition.maxRepeat : 1;
    }


    /**
     *
     * Checking for any required fields that were not submitted.
     *
     * @param {object} validationResponse - The validation response to update with any errors.
     * @param {function} cb
     */
    function checkIfRequiredFieldsNotSubmitted(validationResponse, cb) {

      //For each of the required fields, check that the fields have submission values
      async.each(Object.keys(submissionRequiredFieldsMap), function(requiredFieldId, cb) {
        var requiredField = submissionRequiredFieldsMap[requiredFieldId];

        //The minimum number of times a section must repeat, means that the required fields in the section must have valid entries for each
        //repetition of the field.
        var minRepeat = getSectionMinRepeat(requiredFieldId);

        async.each(_.range(minRepeat), function(sectionIndex, sectionCb) {
          var isSubmitted = requiredField && requiredField.sections && requiredField.sections[sectionIndex] && requiredField.sections[sectionIndex].submitted;

          if (!isSubmitted) {
            //Checking if the field for this section index is visible.
            //This can change based on the section index as rules within the section may source
            //their values from within the repeating section.
            isFieldVisible(requiredFieldId, true, sectionIndex, function(err, visible) {
              var fieldValidationDetails = {};
              if (err) {
                return sectionCb(err);
              }

              if (visible && requiredField.valueRequired) { // we only care about required fields if they are visible
                fieldValidationDetails.fieldId = requiredFieldId;
                fieldValidationDetails.valid = false;
                fieldValidationDetails.fieldErrorMessage = ["Required Field Not Submitted"];
                fieldValidationDetails.sectionId = fieldSectionMapping[requiredFieldId];
                fieldValidationDetails.sectionIndex = sectionIndex;

                assignValidationResponse(requiredFieldId, sectionIndex, validationResponse.validation, fieldValidationDetails);
                validationResponse.validation.valid = false;
              }
              return sectionCb();
            });
          } else { // was included in submission
            return sectionCb();
          }
        }, cb);
      }, function(err) {
        return cb(err, validationResponse);
      });
    }

    /**
     * validate only field values on validation (no rules, no repeat checking)
     *     res:
     *     "validation":{
     *             "fieldId":{
     *                 "fieldId":"",
     *                 "valid":true,
     *                 "errorMessages":[
     *                     "length should be 3 to 5",
     *                     "should not contain dammit"
     *                 ]
     *             }
     *         }
     */
    function validateField(fieldId, submission, sectionIndex, cb) {
      init();

      if (_.isFunction(sectionIndex)) {
        cb = sectionIndex;
        sectionIndex = 0;
      }

      var err = initSubmission(submission);
      if (err) {
        return cb(err);
      }

      var submissionField = submissionFieldsMap[fieldId][sectionIndex];
      var fieldDef = fieldMap[fieldId];

      getFieldValidationStatus(submissionField, fieldDef, null, function(err, res) {
        if (err) {
          return cb(err);
        }
        var ret = {
          validation: {}
        };

        assignValidationResponse(fieldId, sectionIndex, ret.validation, res);
        return cb(undefined, ret);
      });
    }

    /*
     * validate only single field value (no rules, no repeat checking)
     * cb(err, result)
     * example of result:
     * "validation":{
     *         "fieldId":{
     *             "fieldId":"",
     *             "valid":true,
     *             "errorMessages":[
     *                 "length should be 3 to 5",
     *                 "should not contain dammit"
     *             ]
     *         }
     *     }
     */
    function validateFieldValue(fieldId, inputValue, valueIndex, sectionIndex, cb) {
      if ("function" === typeof valueIndex) {
        cb = valueIndex;
        valueIndex = 0;
        sectionIndex = 0;
      }

      if (_.isFunction(sectionIndex)) {
        cb = sectionIndex;
        sectionIndex = 0;
      }

      init();

      var fieldDefinition = fieldMap[fieldId];

      var required = false;
      if (fieldDefinition.repeating &&
          fieldDefinition.fieldOptions &&
          fieldDefinition.fieldOptions.definition &&
          fieldDefinition.fieldOptions.definition.minRepeat) {
        required = (valueIndex < fieldDefinition.fieldOptions.definition.minRepeat);
      } else {
        required = fieldDefinition.required;
      }

      var validation = (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) ? fieldDefinition.fieldOptions.validation : undefined;

      if (validation && false === validation.validateImmediately) {
        var ret = {
          validation: {valid: true}
        };

        assignValidationResponse(fieldId, sectionIndex, ret.validation, {
          "valid": true
        });

        return cb(undefined, ret);
      }

      var requiredFieldEntry = requiredFieldMap[fieldDefinition._id] || {valueRequired: required};

      if (fieldEmpty(inputValue)) {
        if (required && requiredFieldEntry.valueRequired) {
          return formatResponse("No value specified for required input", cb);
        } else {
          return formatResponse(undefined, cb); // optional field not supplied is valid
        }
      }

      // not empty need to validate
      getClientValidatorFunction(fieldDefinition.type, function(err, validator) {
        if (err) {
          return cb(err);
        }

        validator(inputValue, fieldDefinition, undefined, function(err) {
          var message;
          if (err) {
            if (err.message) {
              message = err.message;
            } else {
              message = "Unknown error message";
            }
          }
          formatResponse(message, cb);
        });
      });

      function formatResponse(msg, cb) {
        var messages = {
          errorMessages: []
        };
        if (msg) {
          messages.errorMessages.push(msg);
        }
        return createValidatorResponse(fieldId, messages, sectionIndex, function(err, res) {
          if (err) {
            return cb(err);
          }
          var ret = {
            validation: {}
          };

          assignValidationResponse(fieldId, sectionIndex, ret.validation, res);

          return cb(undefined, ret);
        });
      }
    }

    function createValidatorResponse(fieldId, messages, sectionIndex, cb) {
      // intentionally not checking err here, used further down to get validation errors
      var res = {};
      res.fieldId = fieldId;
      res.sectionIndex = sectionIndex;
      res.errorMessages = messages.errorMessages || [];
      res.fieldErrorMessage = messages.fieldErrorMessage || [];
      async.some(res.errorMessages, function(item, cb) {
        return cb(item !== null);
      }, function(someErrors) {
        res.valid = !someErrors && (res.fieldErrorMessage.length < 1);

        return cb(undefined, res);
      });
    }

    function getFieldValidationStatus(submittedField, fieldDef, previousFieldValues, cb) {
      var sectionIndex = submittedField.sectionIndex || 0;

      isFieldVisible(fieldDef._id, true, sectionIndex, function(err, visible) {
        if (err) {
          return cb(err);
        }

        validateFieldInternal(submittedField, fieldDef, previousFieldValues, visible, function(err, messages) {
          if (err) {
            return cb(err);
          }

          createValidatorResponse(submittedField.fieldId, messages, sectionIndex, cb);
        });
      });
    }

    function getMapFunction(key, map, cb) {
      var validator = map[key];
      if (!validator) {
        return cb(new Error("Invalid Field Type " + key));
      }

      return cb(undefined, validator);
    }

    function getValidatorFunction(fieldType, cb) {
      return getMapFunction(fieldType, validatorsMap, cb);
    }

    function getClientValidatorFunction(fieldType, cb) {
      return getMapFunction(fieldType, validatorsClientMap, cb);
    }

    function fieldEmpty(fieldValue) {
      return ('undefined' === typeof fieldValue || null === fieldValue || "" === fieldValue); // empty string also regarded as not specified
    }

    function validateFieldInternal(submittedField, fieldDef, previousFieldValues, visible, cb) {

      previousFieldValues = previousFieldValues || null;
      countSubmittedValues(submittedField, function(err, numSubmittedValues) {
        if (err) {
          return cb(err);
        }
        //Marking the visibility of the field on the definition.
        fieldDef.visible = visible;
        async.series({
          valuesSubmitted: async.apply(checkValueSubmitted, submittedField, fieldDef, visible),
          repeats: async.apply(checkRepeat, numSubmittedValues, fieldDef, visible),
          values: async.apply(checkValues, submittedField, fieldDef, previousFieldValues)
        }, function(err, results) {
          if (err) {
            return cb(err);
          }

          var fieldErrorMessages = [];
          if (results.valuesSubmitted) {
            fieldErrorMessages.push(results.valuesSubmitted);
          }
          if (results.repeats) {
            fieldErrorMessages.push(results.repeats);
          }
          return cb(undefined, {
            fieldErrorMessage: fieldErrorMessages,
            errorMessages: results.values
          });
        });
      });

      return; // just functions below this

      function checkValueSubmitted(submittedField, fieldDefinition, visible, cb) {
        if (!fieldDefinition.required) {
          return cb(undefined, null);
        }

        var valueSubmitted = submittedField && submittedField.fieldValues && (submittedField.fieldValues.length > 0);
        //No value submitted is only an error if the field is visible.

        //If the field value has been marked as not required, then don't fail a no-value submission
        var valueRequired = requiredFieldMap[fieldDefinition._id] && requiredFieldMap[fieldDefinition._id].valueRequired;

        if (!valueSubmitted && visible && valueRequired) {
          return cb(undefined, "No value submitted for field " + fieldDefinition.name);
        }
        return cb(undefined, null);

      }

      function countSubmittedValues(submittedField, cb) {
        var numSubmittedValues = 0;
        if (submittedField && submittedField.fieldValues && submittedField.fieldValues.length > 0) {
          for (var i = 0; i < submittedField.fieldValues.length; i += 1) {
            if (submittedField.fieldValues[i]) {
              numSubmittedValues += 1;
            }
          }
        }
        return cb(undefined, numSubmittedValues);
      }

      function checkRepeat(numSubmittedValues, fieldDefinition, visible, cb) {
        //If the field is not visible, then checking the repeating values of the field is not required
        if (!visible) {
          return cb(undefined, null);
        }

        if (fieldDefinition.repeating && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.definition) {
          if (fieldDefinition.fieldOptions.definition.minRepeat) {
            if (numSubmittedValues < fieldDefinition.fieldOptions.definition.minRepeat) {
              return cb(undefined, "Expected min of " + fieldDefinition.fieldOptions.definition.minRepeat + " values for field " + fieldDefinition.name + " but got " + numSubmittedValues);
            }
          }

          if (fieldDefinition.fieldOptions.definition.maxRepeat) {
            if (numSubmittedValues > fieldDefinition.fieldOptions.definition.maxRepeat) {
              return cb(undefined, "Expected max of " + fieldDefinition.fieldOptions.definition.maxRepeat + " values for field " + fieldDefinition.name + " but got " + numSubmittedValues);
            }
          }
        } else if (numSubmittedValues > 1) {
          return cb(undefined, "Should not have multiple values for non-repeating field");
        }

        return cb(undefined, null);
      }

      function checkValues(submittedField, fieldDefinition, previousFieldValues, cb) {
        var sectionIndex = submittedField.sectionIndex || 0;

        getValidatorFunction(fieldDefinition.type, function(err, validator) {
          if (err) {
            return cb(err);
          }

          async.map(submittedField.fieldValues, function(fieldValue, cb) {
            if (fieldEmpty(fieldValue)) {
              return cb(undefined, null);
            } else {
              validator(fieldValue, fieldDefinition, previousFieldValues, function(validationError) {
                var errorMessage;
                if (validationError) {
                  errorMessage = validationError.message || "Error during validation of field";
                } else {
                  errorMessage = null;
                }

                submissionRequiredFieldsMap[fieldDefinition._id] = submissionRequiredFieldsMap[fieldDefinition._id] || {sections: {}};
                submissionRequiredFieldsMap[fieldDefinition._id].sections[sectionIndex] = submissionRequiredFieldsMap[fieldDefinition._id].sections[sectionIndex] || {};
                var sectionValues = submissionRequiredFieldsMap[fieldDefinition._id].sections[sectionIndex];

                if (sectionValues) { // set to true if at least one value
                  sectionValues.submitted = true;
                }

                return cb(undefined, errorMessage);
              });
            }
          }, function(err, results) {
            if (err) {
              return cb(err);
            }

            return cb(undefined, results);
          });
        });
      }
    }

    function convertSimpleFormatToRegex(field_format_string) {
      var regex = "^";
      var C = "c".charCodeAt(0);
      var N = "n".charCodeAt(0);

      var i;
      var ch;
      var match;
      var len = field_format_string.length;
      for (i = 0; i < len; i += 1) {
        ch = field_format_string.charCodeAt(i);
        switch (ch) {
        case C:
          match = "[a-zA-Z0-9]";
          break;
        case N:
          match = "[0-9]";
          break;
        default:
          var num = ch.toString(16).toUpperCase();
          match = "\\u" + ("0000" + num).substr(-4);
          break;
        }
        regex += match;
      }
      return regex + "$";
    }

    function validFormatRegex(fieldValue, field_format_string) {
      var pattern = new RegExp(field_format_string);
      return pattern.test(fieldValue);
    }

    function validFormat(fieldValue, field_format_mode, field_format_string) {
      var regex;
      if ("simple" === field_format_mode) {
        regex = convertSimpleFormatToRegex(field_format_string);
      } else if ("regex" === field_format_mode) {
        regex = field_format_string;
      } else { // should never be anything else, but if it is then default to simple format
        regex = convertSimpleFormatToRegex(field_format_string);
      }

      return validFormatRegex(fieldValue, regex);
    }

    function validatorString(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "string") {
        return cb(new Error("Expected string but got " + typeof(fieldValue)));
      }

      var validation = {};
      if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
        validation = fieldDefinition.fieldOptions.validation;
      }

      var field_format_mode = validation.field_format_mode || "";
      field_format_mode = field_format_mode.trim();
      var field_format_string = validation.field_format_string || "";
      field_format_string = field_format_string.trim();

      if (field_format_string && (field_format_string.length > 0) && field_format_mode && (field_format_mode.length > 0)) {
        if (!validFormat(fieldValue, field_format_mode, field_format_string)) {
          return cb(new Error("field value in incorrect format, expected format: " + field_format_string + " but submission value is: " + fieldValue));
        }
      }

      if (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.min) {
        if (fieldValue.length < fieldDefinition.fieldOptions.validation.min) {
          return cb(new Error("Expected minimum string length of " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
        }
      }

      if (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.max) {
        if (fieldValue.length > fieldDefinition.fieldOptions.validation.max) {
          return cb(new Error("Expected maximum string length of " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
        }
      }

      return cb();
    }

    function validatorNumericString(fieldValue, fieldDefinition, previousFieldValues, cb) {
      var testVal = (fieldValue - 0); // coerce to number (or NaN)
      /* eslint-disable eqeqeq */
      var numeric = (testVal == fieldValue); // testVal co-erced to numeric above, so numeric comparison and NaN != NaN

      if (!numeric) {
        return cb(new Error("Expected numeric but got: " + fieldValue));
      }

      return validatorNumber(testVal, fieldDefinition, previousFieldValues, cb);
    }

    function validatorNumber(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "number") {
        return cb(new Error("Expected number but got " + typeof(fieldValue)));
      }

      if (fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.min) {
        if (fieldValue < fieldDefinition.fieldOptions.validation.min) {
          return cb(new Error("Expected minimum Number " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue + ". Submitted number: " + fieldValue));
        }
      }

      if (fieldDefinition.fieldOptions.validation.max) {
        if (fieldValue > fieldDefinition.fieldOptions.validation.max) {
          return cb(new Error("Expected maximum Number " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue + ". Submitted number: " + fieldValue));
        }
      }

      return cb();
    }

    function validatorEmail(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected string but got " + typeof(fieldValue)));
      }

      if (fieldValue.match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/g) === null) {
        return cb(new Error("Invalid email address format: " + fieldValue));
      } else {
        return cb();
      }
    }

    /**
     * isSafeString - Checks if special characters in strings have already been escaped.
     *
     * @param  {string} str               The string to check.
     * @return {boolean}
     */
    function isSafeString(str) {
      var escape = ['&amp;', '&lt;', '&gt;', '&quot;', '&#x27;', '&#96;'];
      if (typeof str !== "string" || (escape.some(function(specialChar) {
        return str.indexOf(specialChar) >= 0;
      }))) {
        return true;
      }
    }

    /**
     * validatorDropDown - Validator function for dropdown fields.
     *
     * @param  {string} fieldValue        The value to validate
     * @param  {object} fieldDefinition   Full JSON definition of the field
     * @param  {array} previousFieldValues Any values previously stored with the fields
     * @param  {function} cb               Callback function
     */
    function validatorDropDown(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected submission to be string but got " + typeof(fieldValue)));
      }

      fieldDefinition.fieldOptions = fieldDefinition.fieldOptions || {};
      fieldDefinition.fieldOptions.definition = fieldDefinition.fieldOptions.definition || {};

      //Check values exists in the field definition
      if (!fieldDefinition.fieldOptions.definition.options) {
        return cb(new Error("No options exist for field " + fieldDefinition.name));
      }

      //Finding the selected option
      var found = _.find(fieldDefinition.fieldOptions.definition.options, function(dropdownOption) {
        //check if fieldValue and the label need to be escaped
        isSafeString(fieldValue) ? null : fieldValue = _.escape(fieldValue);
        dropdownOption.label = _.escape(dropdownOption.label);
        return dropdownOption.label === fieldValue;
      });

      //Valid option, can return
      if (found) {
        return cb();
      }

      //If the option is empty and the field is required, then the blank option is being submitted
      //The blank option is not valid for a required field.
      if (found === "" && fieldDefinition.required && fieldDefinition.fieldOptions.definition.include_blank_option) {
        return cb(new Error("The Blank Option is not valid. Please select a value."));
      } else {
        //Otherwise, it is an invalid option
        return cb(new Error("Invalid option specified: " + fieldValue));
      }
    }

    /**
     * validatorRadio - Validator function for radio fields.
     *
     * @param  {string} fieldValue        The value to validate
     * @param  {object} fieldDefinition   Full JSON definition of the field
     * @param  {array} previousFieldValues Any values previously stored with the fields
     * @param  {function} cb               Callback function
     */
    function validatorRadio(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected submission to be string but got " + typeof(fieldValue)));
      }

      //Check value exists in the field definition
      if (!fieldDefinition.fieldOptions.definition.options) {
        return cb(new Error("No options exist for field " + fieldDefinition.name));
      }

      async.some(fieldDefinition.fieldOptions.definition.options, function(dropdownOption, cb) {
        //check if fieldValue and the label need to be escaped
        isSafeString(fieldValue) ? null : fieldValue = _.escape(fieldValue);
        dropdownOption.label = _.escape(dropdownOption.label);        return cb(dropdownOption.label === fieldValue);
      }, function(found) {
        if (!found) {
          return cb(new Error("Invalid option specified: " + fieldValue));
        } else {
          return cb();
        }
      });
    }

    function validatorCheckboxes(fieldValue, fieldDefinition, previousFieldValues, cb) {
      var minVal;

      if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
        minVal = fieldDefinition.fieldOptions.validation.min;
      }
      var maxVal;
      if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
        maxVal = fieldDefinition.fieldOptions.validation.max;
      }

      if (minVal) {
        if (fieldValue.selections === null || fieldValue.selections === undefined || fieldValue.selections.length < minVal && fieldDefinition.visible) {
          var len;
          if (fieldValue.selections) {
            len = fieldValue.selections.length;
          }
          return cb(new Error("Expected a minimum number of selections " + minVal + " but got " + len));
        }
      }

      if (maxVal) {
        if (fieldValue.selections) {
          if (fieldValue.selections.length > maxVal) {
            return cb(new Error("Expected a maximum number of selections " + maxVal + " but got " + fieldValue.selections.length));
          }
        }
      }

      var optionsInCheckbox = [];

      async.eachSeries(fieldDefinition.fieldOptions.definition.options, function(choice, cb) {
        for (var choiceName in choice) { // eslint-disable-line guard-for-in
          optionsInCheckbox.push(choice[choiceName]);
        }
        return cb();
      }, function() {
        async.eachSeries(fieldValue.selections, function(selection, cb) {
          if (typeof(selection) !== "string") {
            return cb(new Error("Expected checkbox submission to be string but got " + typeof(selection)));
          }

          //selection needs to be escaped here
          selection = _.escape(selection);
          for (var i = 0; i < optionsInCheckbox.length; i++) {
            optionsInCheckbox[i] = _.escape(optionsInCheckbox[i]);
          }
          if (optionsInCheckbox.indexOf(selection) === -1) {
            return cb(new Error("Checkbox Option " + selection + " does not exist in the field."));
          }

          return cb();
        }, cb);
      });
    }

    function validatorLocationMap(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (fieldValue.lat && fieldValue["long"]) {
        if (isNaN(parseFloat(fieldValue.lat)) || isNaN(parseFloat(fieldValue["long"]))) {
          return cb(new Error("Invalid latitude and longitude values"));
        } else {
          return cb();
        }
      } else {
        return cb(new Error("Invalid object for locationMap submission"));
      }
    }


    function validatorLocation(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (fieldDefinition.fieldOptions.definition.locationUnit === "latlong") {
        if (fieldValue.lat && fieldValue["long"]) {
          if (isNaN(parseFloat(fieldValue.lat)) || isNaN(parseFloat(fieldValue["long"]))) {
            return cb(new Error("Invalid latitude and longitude values"));
          } else {
            return cb();
          }
        } else {
          return cb(new Error("Invalid object for latitude longitude submission"));
        }
      } else if (fieldValue.zone && fieldValue.eastings && fieldValue.northings) {
          //Zone must be 3 characters, eastings 6 and northings 9
        return validateNorthingsEastings(fieldValue, cb);
      } else {
        return cb(new Error("Invalid object for northings easting submission. Zone, Eastings and Northings elements are required"));
      }

      function validateNorthingsEastings(fieldValue, cb) {
        if (typeof(fieldValue.zone) !== "string" || fieldValue.zone.length === 0) {
          return cb(new Error("Invalid zone definition for northings and eastings location. " + fieldValue.zone));
        }

        var east = parseInt(fieldValue.eastings, 10);
        if (isNaN(east)) {
          return cb(new Error("Invalid eastings definition for northings and eastings location. " + fieldValue.eastings));
        }

        var north = parseInt(fieldValue.northings, 10);
        if (isNaN(north)) {
          return cb(new Error("Invalid northings definition for northings and eastings location. " + fieldValue.northings));
        }

        return cb();
      }
    }

    function validatorAnyFile(fieldValue, fieldDefinition, previousFieldValues, cb) {
      // if any of the following validators return ok, then return ok.
      validatorBase64(fieldValue, fieldDefinition, previousFieldValues, function(err) {
        if (!err) {
          return cb();
        }
        validatorFile(fieldValue, fieldDefinition, previousFieldValues, function(err) {
          if (!err) {
            return cb();
          }
          validatorFileObj(fieldValue, fieldDefinition, previousFieldValues, function(err) {
            if (!err) {
              return cb();
            }
            return cb(err);
          });
        });
      });
    }

    /**
     * Function to validate a barcode submission
     *
     * Must be an object with the following contents
     *
     * {
     *   text: "<<content of barcode>>",
     *   format: "<<barcode content format>>"
     * }
     *
     * @param fieldValue
     * @param fieldDefinition
     * @param previousFieldValues
     * @param cb
     */
    function validatorBarcode(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof(fieldValue) !== "object" || fieldValue === null) {
        return cb(new Error("Expected object but got " + typeof(fieldValue)));
      }

      if (typeof(fieldValue.text) !== "string" || fieldValue.text.length === 0) {
        return cb(new Error("Expected text parameter."));
      }

      if (typeof(fieldValue.format) !== "string" || fieldValue.format.length === 0) {
        return cb(new Error("Expected format parameter."));
      }

      return cb();
    }

    function checkFileSize(fieldDefinition, fieldValue, sizeKey, cb) {
      fieldDefinition = fieldDefinition || {};
      var fieldOptions = fieldDefinition.fieldOptions || {};
      var fieldOptionsDef = fieldOptions.definition || {};
      //FileSizeMax will be in KB. File size is in bytes
      var fileSizeMax = fieldOptionsDef.file_size || null;

      if (fileSizeMax !== null) {
        var fieldValueSize = fieldValue[sizeKey];
        var fieldValueSizeKB = 1;
        if (fieldValueSize > 1000) {
          fieldValueSizeKB = fieldValueSize / 1000;
        }
        if (fieldValueSize > (fileSizeMax * 1000)) {
          return cb(new Error("File size is too large. File can be a maximum of " + fileSizeMax + "KB. Size of file selected: " + fieldValueSizeKB + "KB"));
        } else {
          return cb();
        }
      } else {
        return cb();
      }
    }

    function validatorFile(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "object") {
        return cb(new Error("Expected object but got " + typeof(fieldValue)));
      }

      var keyTypes = [
        {
          keyName: "fileName",
          valueType: "string"
        },
        {
          keyName: "fileSize",
          valueType: "number"
        },
        {
          keyName: "fileType",
          valueType: "string"
        },
        {
          keyName: "fileUpdateTime",
          valueType: "number"
        },
        {
          keyName: "hashName",
          valueType: "string"
        }
      ];

      async.each(keyTypes, function(keyType, cb) {
        var actualType = typeof fieldValue[keyType.keyName];
        if (actualType !== keyType.valueType) {
          return cb(new Error("Expected " + keyType.valueType + " but got " + actualType));
        }
        if (keyType.keyName === "fileName" && fieldValue[keyType.keyName].length <= 0) {
          return cb(new Error("Expected value for " + keyType.keyName));
        }

        return cb();
      }, function(err) {
        if (err) {
          return cb(err);
        }

        checkFileSize(fieldDefinition, fieldValue, "fileSize", function(err) {
          if (err) {
            return cb(err);
          }

          if (fieldValue.hashName.indexOf("filePlaceHolder") > -1) { //TODO abstract out to config
            return cb();
          } else if (previousFieldValues && previousFieldValues.hashName && previousFieldValues.hashName.indexOf(fieldValue.hashName) > -1) {
            return cb();
          } else {
            return cb(new Error("Invalid file placeholder text" + fieldValue.hashName));
          }
        });
      });
    }

    function validatorFileObj(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if ((typeof File !== "function")) {
        return cb(new Error("Expected File object but got " + typeof(fieldValue)));
      }

      var keyTypes = [
        {
          keyName: "name",
          valueType: "string"
        },
        {
          keyName: "size",
          valueType: "number"
        }
      ];

      async.each(keyTypes, function(keyType, cb) {
        var actualType = typeof fieldValue[keyType.keyName];
        if (actualType !== keyType.valueType) {
          return cb(new Error("Expected " + keyType.valueType + " but got " + actualType));
        }
        if (actualType === "string" && fieldValue[keyType.keyName].length <= 0) {
          return cb(new Error("Expected value for " + keyType.keyName));
        }
        if (actualType === "number" && fieldValue[keyType.keyName] <= 0) {
          return cb(new Error("Expected > 0 value for " + keyType.keyName));
        }

        return cb();
      }, function(err) {
        if (err) {
          return cb(err);
        }


        checkFileSize(fieldDefinition, fieldValue, "size", function(err) {
          if (err) {
            return cb(err);
          }
          return cb();
        });
      });
    }

    function validatorBase64(fieldValue, fieldDefinition, previousFieldValues, cb) {
      if (typeof fieldValue !== "string") {
        return cb(new Error("Expected base64 string but got " + typeof(fieldValue)));
      }

      if (fieldValue.length <= 0) {
        return cb(new Error("Expected base64 string but was empty"));
      }

      return cb();
    }

    function validatorDateTime(fieldValue, fieldDefinition, previousFieldValues, cb) {
      var valid = false;

      if (typeof(fieldValue) !== "string") {
        return cb(new Error("Expected string but got " + typeof(fieldValue)));
      }

      switch (fieldDefinition.fieldOptions.definition.datetimeUnit) {
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:

        var validDateFormats = ["YYYY/MM/DD", "YYYY/MM/DD", "YYYY-MM-DD", "YYYY-MM-DD"];

        valid = _.find(validDateFormats, function(expectedFormat) {
          return moment(fieldValue, expectedFormat, true).isValid();
        });

        if (valid) {
          return cb();
        } else {
          return cb(new Error("Invalid date value " + fieldValue + ". Date format is YYYY/MM/DD"));
        }
        break; // eslint-disable-line no-unreachable
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:
        valid = moment(fieldValue, "HH:mm:ss", true).isValid() || moment(fieldValue, "HH:mm", true).isValid();
        if (valid) {
          return cb();
        } else {
          return cb(new Error("Invalid time value " + fieldValue + ". Time format is HH:mm:ss or HH:mm"));
        }
        break; // eslint-disable-line no-unreachable
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
        var validDateTimeFormats = fieldDefinition.fieldOptions.definition.dateTimeFormat ? [fieldDefinition.fieldOptions.definition.dateTimeFormat] : ["YYYY/MM/DD HH:mm:ss", "YYYY/MM/DD HH:mm", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm"];

        valid = _.find(validDateTimeFormats, function(expectedFormat) {
          return moment(fieldValue, expectedFormat, true).isValid();
        });

        if (valid) {
          return cb();
        } else {
          return cb(new Error("Invalid dateTime string " + fieldValue + ". dateTime format is " + validDateTimeFormats.join(" or ")));
        }
        break; // eslint-disable-line no-unreachable
      default:
        return cb(new Error("Invalid dateTime fieldtype " + fieldDefinition.fieldOptions.definition.datetimeUnit));
      }
    }

    function validatorSection(value, fieldDefinition, previousFieldValues, cb) {
      return cb(new Error("Should not submit section field: " + fieldDefinition.name));
    }

    /**
     *
     * Checking a single rule conditional statement to determine of the rule is active.
     *
     * @param {string} fieldId
     * @param {number} sectionIndex
     * @param {Array} predicateMapQueries
     * @param {Array} predicateMapPassed
     * @param {object} ruleConditionalStatement
     * @param {function} cbPredicates
     * @returns {*}
     */
    function checkSingleRuleConditionalStatement(fieldId, sectionIndex, predicateMapQueries, predicateMapPassed, ruleConditionalStatement, cbPredicates) {
      var field = fieldMap[ruleConditionalStatement.sourceField];
      var passed = false;
      var submissionValues = [];
      var condition;
      var testValue;

      //Getting the section ID for the target field. The field may be in a repeating section
      var sectionIdForTargetField = fieldSectionMapping[fieldId];

      var sectionIdForSourceField = fieldSectionMapping[ruleConditionalStatement.sourceField];

      //The fields are in the same section if and only if the sectionIds are the same OR neither are in a section
      var sameSection = sectionIdForTargetField === sectionIdForSourceField;

      var sourceFieldValues = submissionFieldsMap[ruleConditionalStatement.sourceField];

      var sourceFieldValue;
      //For repeating sections, if a source field for a rule conditional statement is outside the section of the target field, the source value has to come from the first section
      if (!sameSection) {
        sourceFieldValue = sourceFieldValues && sourceFieldValues[0] ? sourceFieldValues[0] : null;
      } else {
        sourceFieldValue = sourceFieldValues && sourceFieldValues[sectionIndex] ? sourceFieldValues[sectionIndex] : null;
      }

      if (sourceFieldValue && sourceFieldValue.fieldValues) {
        submissionValues = sourceFieldValue.fieldValues;
        condition = ruleConditionalStatement.restriction;
        testValue = ruleConditionalStatement.sourceValue;

        // Validate rule predicates on the first entry only.
        passed = isConditionActive(field, submissionValues[0], testValue, condition);
      }

      predicateMapQueries.push({
        "field": field,
        "sectionIndex": sectionIndex,
        "submissionValues": submissionValues,
        "condition": condition,
        "testValue": testValue,
        "passed": passed
      });

      if (passed) {
        predicateMapPassed.push(field);
      }
      return cbPredicates();
    }

    /**
     *
     * Processing all of the rules that target a single field/page to check if the rule is active or not.
     *
     * @param {string|null} fieldId - The ID of the field being checked. If it is null then it is a page rule being checked.
     * @param {Array} rules
     * @param {number} sectionIndex
     * @param {function} cb
     */
    function rulesResult(fieldId, rules, sectionIndex, cb) {
      var visible = true;

      // Iterate over each rule that this field is a predicate of
      async.each(rules, function(rule, cbRule) {
        // For each rule, iterate over the predicate fields and evaluate the rule
        var predicateMapQueries = [];
        var predicateMapPassed = [];
        async.each(rule.ruleConditionalStatements, async.apply(checkSingleRuleConditionalStatement, fieldId, sectionIndex, predicateMapQueries, predicateMapPassed), function(err) {
          if (err) {
            cbRule(err);
          }

          function rulesPassed(condition, passed, queries) {
            return ((condition === "and") && ((passed.length === queries.length))) || // "and" condition - all rules must pass
            ((condition === "or") && ((passed.length > 0))); // "or" condition - only one rule must pass
          }

          /**
           * If any rule condition that targets the field/page hides that field/page, then the page is hidden.
           * Hiding the field/page takes precedence over any show. This will maintain consistency.
           * E.g. if x is y then hide p1,p2 takes precedence over if x is y then show p1, p2
           */
          if (rulesPassed(rule.ruleConditionalOperator, predicateMapPassed, predicateMapQueries)) {
            visible = (rule.type === "show") && visible;
          } else {
            visible = (rule.type !== "show") && visible;
          }

          return cbRule();
        });
      }, function(err) {
        return cb(err, visible);
      });
    }

    function isPageVisible(pageId, cb) {
      init();
      if (isPageRuleSubject(pageId)) { // if the page is the target of a rule
        return rulesResult(null, pageRuleSubjectMap[pageId], 0, cb); // execute page rules
      } else {
        return cb(undefined, true); // if page is not subject of any rule then must be visible
      }
    }

    /**
     *
     * Checking to see if the field is visible for a section
     *
     * @param fieldId
     * @param checkContainingPage
     * @param [sectionIndex]
     * @param cb
     * @returns {*}
     */
    function isFieldVisible(fieldId, checkContainingPage, sectionIndex, cb) {

      //Keeping backwards compatiblity
      if (_.isFunction(sectionIndex)) {
        cb = sectionIndex;
        sectionIndex = 0;
      }

      /*
       * fieldId = Id of field to check for rule predicate references
       * checkContainingPage = if true check page containing field, and return false if the page is hidden
       */
      init();
      // Fields are visible by default
      var field = fieldMap[fieldId];

      /**
       * If the field is an admin field, the rules engine returns an error, as admin fields cannot be the subject of rules engine actions.
       */
      if (adminFieldMap[fieldId]) {
        return cb(new Error("Submission " + fieldId + " is an admin field. Admin fields cannot be passed to the rules engine."));
      } else if (!field) {
        return cb(new Error("Field does not exist in form"));
      }

      async.waterfall([

        function testPage(cb) {
          if (checkContainingPage) {
            isPageVisible(field.pageId, cb);
          } else {
            return cb(undefined, true);
          }
        },
        function testField(pageVisible, cb) {
          if (!pageVisible) { // if page containing field is not visible then don't need to check field
            return cb(undefined, false);
          }

          if (isFieldRuleSubject(fieldId)) { // If the field is the subject of a rule it may have been hidden
            return rulesResult(fieldId, fieldRuleSubjectMap[fieldId], sectionIndex, cb); // execute field rules
          } else {
            return cb(undefined, true); // if not subject of field rules then can't be hidden
          }
        }
      ], cb);
    }

    /*
     * check all rules actions
     *      res:
     *      {
     *          "actions": {
     *              "pages": {
     *                  "targetId": {
     *                      "targetId": "",
     *                      "action": "show|hide"
     *                  }
     *              },
     *              "fields": {
     *              }
     *          }
     *      }
     */
    function checkRules(submissionJSON, cb) {
      init();
      var err = initSubmission(submissionJSON);
      if (err) {
        return cb(err);
      }
      var actions = {};

      async.parallel([

        function(cb) {
          actions.fields = {};
          async.eachSeries(Object.keys(fieldRuleSubjectMap), function(fieldId, cb) {

            var minRepeat = getSectionMinRepeat(fieldId);

            async.each(_.range(minRepeat), function(sectionIndex, sectionCb) {
              isFieldVisible(fieldId, false, sectionIndex, function(err, fieldVisible) {
                if (err) {
                  return cb(err);
                }
                actions.fields[fieldId] = {
                  targetId: fieldId,
                  sectionIndex: sectionIndex,
                  action: (fieldVisible ? "show" : "hide")
                };
                return sectionCb();
              });
            }, cb);
          }, cb);
        },
        function(cb) {
          actions.pages = {};
          async.eachSeries(Object.keys(pageRuleSubjectMap), function(pageId, cb) {
            isPageVisible(pageId, function(err, pageVisible) {
              if (err) {
                return cb(err);
              }
              actions.pages[pageId] = {
                targetId: pageId,
                action: (pageVisible ? "show" : "hide")
              };
              return cb();
            });
          }, cb);
        }
      ], function(err) {
        if (err) {
          return cb(err);
        }

        return cb(undefined, {
          actions: actions
        });
      });
    }

    /**
     *
     * Checking to see if a rule condition is active.
     *
     * @param {object} field - JSON definition of the field
     * @param {*} fieldValue - The value obtained for the field from the submission
     * @param {*} testValue - The value to compare against to see if the condition is active.
     * @param {string} condition - The condition to compare the values (E.g. "is equal to")
     * @returns {*}
     */
    function isConditionActive(field, fieldValue, testValue, condition) {

      var fieldType = field.type;
      var fieldOptions = field.fieldOptions ? field.fieldOptions : {};

      if (typeof(fieldValue) === 'undefined' || fieldValue === null) {
        return false;
      }

      if (typeof(fieldValueComparison[fieldType]) === "function") {
        return fieldValueComparison[fieldType](fieldValue, testValue, condition, fieldOptions);
      } else {
        return false;
      }

    }

    function isNumberBetween(num, min, max) {
      var numVal = parseInt(num, 10);
      return (!isNaN(numVal) && (numVal >= min) && (numVal <= max));
    }

    return {
      validateForm: validateForm,
      validateField: validateField,
      validateFieldValue: validateFieldValue,
      checkRules: checkRules,

      // The following are used internally, but exposed for tests
      validateFieldInternal: validateFieldInternal,
      initSubmission: initSubmission,
      isFieldVisible: isFieldVisible,
      isConditionActive: isConditionActive
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = formsRulesEngine;
  }

  /*globals appForm */
  if (typeof appForm !== 'undefined') {
    appForm.RulesEngine = formsRulesEngine;
  }
}());
