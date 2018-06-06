var Handlebars = require('handlebars');
var _ = require('underscore');
var dateFormatter = require('../utils/date_formatter');

/**
 * NOTE THESE HELPERS COME FROM THE STUDIO/NGUI AS THEY ARE USED WITH THE SUBMISSION TEMPLATE THERE TOO
 */
Handlebars.registerHelper("hasLength", function(options, context) {
  if (options && options.length > 0) {
    return context.fn(this);
  }
  return false;
});

/*jshint scripturl:true*/
Handlebars.registerHelper("createFormField", function(options, editMode) {
  //"location", "locationMap", "sectionBreak", "matrix"
  var i = 0;
  var template;

  if (!options) {
    return;
  }

  // Apply context data to each template so we can effectively render it
  var definition = options && options.fieldOptions && options.fieldOptions.definition || false; // convenience property
  options.data = [];

  function buildMulti(data, definition, val, index, sectionIndex) {
    data.options = []; // Template iterates over these to draw the radios or checkboxes or dropdown options
    for (var j = 0; definition.options && j < definition.options.length; j++) {
      var opt = definition.options[j];
      var optData = {
        label: opt.label,
        _id: options._id + '_' + (sectionIndex || 0),
        idx: index
      };
      // Some use the checked prop, some use selected..
      if (options.type === 'checkboxes') {
        val.selections = val.selections || [];
        // NB Checkboxes has a "selections" object where the array lives, unlike radio and dropdown because who needs to be consistant
        optData.checked = val.selections.indexOf(opt.label) > -1 ? 'checked' : '';
      } else {
        optData.selected = val.indexOf(opt.label) > -1 ? 'selected' : '';
        optData.checked = val.indexOf(opt.label) > -1 ? 'checked' : '';
      }
      data.options.push(optData);
    }
  }

  if (options.values.length < 1 || (options.values && options.values.selections)) { //no values
    options.data.push({
      _id: options._id
    });
    buildMulti(options.data[0], definition, [], 0);
  }

  // Iterate over field values (in case of multi-field form) - often this is just a single element in the array.
  for (i = 0; i < options.values.length; i++) {

    var val = options.values[i];
    var data = {};
    data.val = val; // Could be a number of things - just a string, array of strings, object - all depends on options.type
    data._id = options._id + '_' + (options.sectionIndex || 0);
    data.missingText = (options.missing) ? "Field no longer in form" : "";
    data.idx = i;
    data.disabled = editMode === true ? '' : 'disabled';
    if (definition && definition.options && definition.options[i]) {
      data.label = definition.options[i].label;
    }

    // Multiple input fields, within a type which can already have many arrays of fields (hasMultiple)
    if (options.type === 'radio' || options.type === 'checkboxes' || options.type === "dropdown") {
      data.options = []; // Template iterates over these to draw the radios or checkboxes or dropdown options
      buildMulti(data, definition, val, i, options.sectionIndex);

    }

    if (options.type === 'location' || options.type === 'locationMap') {
      if (definition && definition.locationUnit === 'latlong') {
        data.maplink = (!val) ? 'javascript:false' : "http://maps.google.com/maps?z=12&t=m&q=loc:" + val.lat + "+" + val.long;
        val = val || {lat: 'No value', long: 'No value'};
        data.lat = val.lat;
        data.long = val.long;
      } else if ('locationMap' === options.type) {
        data.lat = val.lat;
        data.long = val.long;
      } else {
        val = val || {eastings: 'No value', northings: 'No value', zone: 'No value'};
        data.zone = val.zone;
        data.eastings = val.eastings;
        data.northings = val.northings;
      }
    }

    if (options.type === 'photo' || options.type === 'signature' || options.type === 'file') {
      data.url = val.downloadUrl || val.url;
      data.val = val.url || val.downloadUrl;
      data.groupid = val.groupId;
      data.hash = val.hashName;
      data.fileName = val.fileName;
      if (typeof(data.url) === "string") {
        data.url = data.url.replace('http://', 'https://');
      }
    }
    options.data.push(data);
  }

  options._idSectionIndex = options._id + '_' + (options.sectionIndex || 0);
  template = Handlebars.compile(_templateForField(options));
  options.hide = (editMode) ? "formVal" : "hide formVal";

  template = template(options);
  return template;


  function _templateForField(options) {
    var template;
    switch (options.type) {
    case "text":
    case "number":
    case "emailAddress":
    case "dateTime":
    case "url":
    case "sliderNumber":
      template = (editMode) ? "<input data-index='{{idx}}' {{disabled}} type='text' name='{{_id}}' placeholder='No value present' value='{{val}}' class='formVal' data-_id='{{_id}}'  />" : "{{val}} <span class='help-inline' style='color: orange;'>{{missingText}}</span>";
      break;
    case "textarea":
      template = (editMode) ? "<textarea data-index='{{idx}}' name='{{_id}}' placeholder='No value present' {{disabled}} class='formVal' data-_id='{{_id}}'  >{{val}}</textarea>" : "<p>{{val}}</p>";
      break;
    case "dropdown":
      template = "<select class='formVal' data-_id='{{_id}}'  {{disabled}} name='{{_id}}' >" +
          "{{#each options}}" +
          "<option value='{{label}}' data-index='{{idx}}' {{selected}}>{{label}}</option>" +
          "{{/each}}" +
          "</select>";
      break;
    case "photo":
    case "signature":
      template = "<img src='{{url}}'>";
      break;
    case "file":
      template = "{{fileName}}<br/> (<a class='btn-small downloadfile icon-download' href='{{url}}' class='btn-small downloadfile icon-download'>{{url}}</a>)";
      break;
    case "checkboxes":
      template = "{{#each options}}" +
          "<input data-checkbox-index='{{@index}}' name='{{_id}}' {{disabled}} class='formVal' data-_id='{{_id}}'  type='checkbox' data-index='{{idx}}' {{checked}} value='{{label}}'> {{label}}<br />" +
          "{{/each}}";
      break;
    case "radio":
      template = "{{#each options}}" +
          "<input data-index='{{idx}}' class='formVal' data-_id='{{_id}}'  data-_id='{{_id}}' name='radio-{{_id}}-{{idx}}' {{disabled}} type='radio' {{checked}} value='{{label}}' > {{label}}<br />" +
          "{{/each}}";
      break;
    case "location":
    case 'locationMap':
      if (options.fieldOptions && options.fieldOptions.definition && "eastnorth" === options.fieldOptions.definition.locationUnit) {
        if (editMode) {
          template = "Eastings: <input class='formVal' data-_id='{{_id}}'  name='eastings' {{disabled}} type='text' placeholder='No value present' value='{{eastings}}' data-index={{idx}} /><br />" +
              "Northings: <input class='formVal' data-_id='{{_id}}'  name='northings' {{disabled}} type='text' placeholder='No value present' value='{{northings}}' data-index={{idx}} /><br />" +
              "Zone: <input name='zone' class='formVal' data-_id='{{_id}}'  {{disabled}} type='text' placeholder='No value present' value='{{zone}}' data-index={{idx}} /><br />";
        } else {
          template = "<label>Eastings:</label> {{eastings}}, <br />" +
              "<label>Northings:</label> {{northings}}, <br />" +
              "<label>Zone:</label> {{zone}}";
        }
      } else {
          // Map link for non-northings eastings for convenience
        template = "<a class='maplink pull-right' target='_blank' href='{{maplink}}'><i class='icon icon-map-marker'></i></a>";
        if (editMode) {
          template += "<label>Latitude:</label> <input name='lat' data-subtype='location' class='formVal' data-_id='{{_id}}'  data-idx='{{idx}}' placeholder='No value present' {{disabled}} type='text' value='{{lat}}' /><br/>" +
              "<label>Longitude:</label> <input data-subtype='location' name='long' data-_id='{{_id}}'  data-idx='{{idx}}' class='formVal' placeholder='No value present' {{disabled}} type='text' value='{{long}}' />";
        } else {
          template += "<label>Latitude:</label> {{lat}},<br /> <label>Longitude:</label> {{long}}";
        }

      }
      break;
    case "barcode":
      template = (editMode) ? "<label>Value:</label><input data-index='{{idx}}' {{disabled}} type='text' name='text' placeholder='No value present' value='{{val.text}}' class='formVal' data-_id='{{_id}}'  /><br />" : "<label>Value:</label> {{val.text}}<br />";
      template += (editMode) ? "<label>Format:</label><input data-index='{{idx}}' {{disabled}} type='text' name='format' placeholder='No value present' value='{{val.format}}' class='formVal' data-_id='{{_id}}'  />" : "<label>Format:</label> {{val.format}}";
      break;
    default:
      break;
    }
    if (options.repeating && options.repeating === true && options.type !== 'sectionBreak') {
      template = "<i class='pull-left icon icon-repeat'></i>" +
        "<ol class='repeating-field-{{_idSectionIndex}}'>" +
        "{{#each data}}" +
        "<li data-index={{idx}}>" +
        template +
        "</li>" +
        "{{/each}}" +
        "</ol>";
    } else if (options.type === 'sectionBreak' && (options.repeating || options.repeatingSectionTurnedOff)) {
      template = "<i class='pull-left icon icon-repeat'></i> Section repeat no. {{idx}}";
    } else if (options.type === 'sectionBreak' && !(options.repeating && options.repeatingSectionTurnedOff)) {
      template = options.helpText || "";
    } else {
      template = "{{#each data}}" +
        template +
        "{{/each}}";
    }

    return template;
  }

});

Handlebars.registerHelper('is', function() {
  var args = Array.prototype.splice.call(arguments, 0);
  if (args.length < 3) {
    throw new Error("Handlebars helper error - must specify at least one field type to match, and the field type to check against e.g. {{#is 'text' fieldType}}foo{{/is}}");
  }
  var options = args.pop();
  var fieldType = args.pop();
  if (args.indexOf(fieldType) > -1) {
    return options.fn(this);
  } else if ('function' === typeof options.inverse) {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('createFieldCode', function(fieldCode) {

  if (fieldCode) {
    return "(" + fieldCode + ")";
  } else {
    return "";
  }
});

Handlebars.registerHelper('createFormLabel', function(fieldType) {

  var ret = '<span class="symbol">{content}<span class="icon {class}"></span></span>';

  switch (fieldType) {
  case "text":
    ret = ret.replace("{class}", "icon-font").replace("{content}", "");
    break;
  case "emailAddress":
    ret = ret.replace("{class}", "icon-envelope-alt").replace("{content}", "");
    break;
  case "number":
  case "sliderNumber":
    ret = ret.replace("{class}", "icon-number").replace("{content}", "123");
    break;
  case "url":
    ret = ret.replace("{class}", "icon-link").replace("{content}", "");
    break;
  case "radio":
    ret = ret.replace("{class}", "icon-circle-blank").replace("{content}", "");
    break;
  case 'locationMap':
    ret = ret.replace("{class}", "icon-map-marker").replace("{content}", "");
    break;
  case "file":
    ret = ret.replace("{class}", "icon-cloud-upload").replace("{content}", "");
    break;
  case "location":
    ret = ret.replace("{class}", "icon-location-arrow").replace("{content}", "");
    break;
  case "dateTime":
    ret = ret.replace("{class}", "icon-calendar").replace("{content}", "");
    break;
  case "dropdown":
    ret = ret.replace("{class}", "icon-caret-down").replace("{content}", "");
    break;
  case "checkboxes":
    ret = ret.replace("{class}", "icon-check").replace("{content}", "");
    break;
  case "photo":
    ret = ret.replace("{class}", "icon-camera").replace("{content}", "");
    break;
  case "textarea":
    ret = ret.replace("{class}", "icon-align-justify").replace("{content}", "");
    break;
  case "signature":
    ret = ret.replace("{class}", "icon-pencil").replace("{content}", "");
    break;
  case "barcode":
    ret = ret.replace("{class}", "icon-barcode").replace("{content}", "");
    break;
  default :
    ret = ret.replace("{content}", "");
    break;
  }

  return ret;
});

Handlebars.registerHelper('createAdminFieldClass', function(adminOnly) {
  return adminOnly ? "admin-field" : "user-field";
});

Handlebars.registerHelper('timeLocalWithOffset', function(ts) {
  return dateFormatter.localWithOffset(ts);
});

module.exports = {
  compileTemplate: function(template) {
    if (_.isString(template)) {
      return Handlebars.compile(template);
    }

    return undefined;
  }
};
