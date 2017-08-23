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


module.exports = {
  getFieldsInSection: getFieldsInSection
};