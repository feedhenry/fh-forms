var _ = require('underscore');

/**
 * Returns all fields that belong to the given section
 * @param sectionId - id of the section.
 * @param fields - form fields  containing the section
 * @returns {Array}
 */
var getFieldsInSection = function(sectionId, fields) {
  var fieldsInSection = [];

  var inSection = false;

  fields.some(function(field) {
    if (!inSection && field.type === "sectionBreak" && field._id === sectionId) {
      inSection = true;
    } else if (inSection && field.type !== "sectionBreak") {
      fieldsInSection.push(field);
    } else {
      return inSection && field.type === "sectionBreak";
    }
  });


  return fieldsInSection;
};

/**
 * Fields in submissions and fields in forms have a little bit different structure, this method converts submission
 * field into a form field.
 * @param field
 */
var convertFieldToFormFormat = function(field) {
  var converted = field.fieldId;
  converted.values = field.fieldValues;
  converted.sectionIndex = field.sectionIndex;
  return converted;
};

/**
 * Builds and returns data used to render repeating sections.
 * @param section
 * @param pageFields
 * @param submittedFields
 * @returns {{renderData: Array, fieldsInSection: Array}}
 */
var buildRepeatingSectionRender = function(section, pageFields, submittedFields) {
  var thisSection = section;
  var fieldsInSection = getFieldsInSection(section._id, pageFields);

  var renderData = [];
  var addedSectionBreaks = false;
  var idsOfFieldsInTheSection = [];

  _.each(fieldsInSection, function(field) {
    idsOfFieldsInTheSection.push(field._id);

    var thisFieldInSection = _.filter(submittedFields, function(subField) {
      return subField.fieldId._id === field._id;
    });

    if (!addedSectionBreaks) {
      _.each(thisFieldInSection, function(field, index) {
        var sectionForIndex = _.clone(thisSection);
        sectionForIndex.idx = index + 1;
        field.sectionIndex = field.sectionIndex || 0;
        renderData[field.sectionIndex] = [sectionForIndex];
      });
      addedSectionBreaks = true;
    }

    _.each(thisFieldInSection, function(field) {
      field.sectionIndex = field.sectionIndex || 0;
      renderData[field.sectionIndex].push(convertFieldToFormFormat(field));
    });
  });
  renderData = _.flatten(renderData);

  return {renderData: renderData, fieldsInSection: idsOfFieldsInTheSection};
};


module.exports = function processForm(form, subData) {
  var merged = subData.formSubmittedAgainst;

  var formPages = subData.formSubmittedAgainst.pages;
  var submittedFields = subData.formFields;

  _.each(formPages, function(page) {
    var pageFields = [];
    var fieldsRendered = [];
    _.each(page.fields, function(field) {
      if (field.type === "sectionBreak" && field.repeating) {
        var repeatingSectionRenderData = buildRepeatingSectionRender(field, page.fields, submittedFields);
        pageFields = pageFields.concat(repeatingSectionRenderData.renderData);
        fieldsRendered = fieldsRendered.concat(repeatingSectionRenderData.fieldsInSection);
      } else if (fieldsRendered.indexOf(field._id) === -1) {
        pageFields.push(field);
      }
      fieldsRendered.push(field._id);
    });
    page.fields = pageFields;
  });

  //need to turn this into a json object.
  var renderData = {
    form: {
      pages: []
    },
    sub: subData
  };
  var pages = merged.pages;

  renderData.form.pages = _.map(pages, function(page, index) {
    if (!page.name) {
      page.name = "page " + (index + 1);
    }

    //Don't need to display readonly fields as they have no input.
    page.fields = _.filter(page.fields, function(field) {
      return field.type !== "readOnly";
    });
    return page;
  });

  renderData._id = subData._id;

  return renderData;
};
