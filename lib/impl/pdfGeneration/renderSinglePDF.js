var path = require('path');
var logger = require('../../common/logger.js').getLogger();
var getCssForPDF = require('./getCSSForPDF');
var _ = require('underscore');
var processForm = require('./processForm');

var destroyPhantomSession = require('./destroyPhantomSession');

/**
 * Rendering The HTML Template To A PDF Document
 * @param params
 *  - template
 *  - session
 *  - form
 *  - submission
 *  - location
 *  - generationTimestamp
 * @param cb
 * @returns {*}
 * @private
 */
function renderPDF(params, cb) {
  var template = params.template;
  var session = params.session;
  var form = params.form;
  var submission = params.submission;
  submission.formName = form.name;
  var studioLocation = params.location;
  var generationTimestamp = params.generationTimestamp || Date.now();

  var page;

  session.createPage()
    .then(function(_page) {
      logger.debug('page created');
      page = _page;
      // A4 aspect ratio
      page.property('paperSize', {format: 'A4'})
        .then(function() {
          logger.debug('page aspect ratio set');

          //Can't load css files over https. Needs to be http.
          if (typeof(studioLocation) === "string") {
            studioLocation = studioLocation.replace("https://", "http://");
          }
          form = processForm(form, submission);
          var html = template({
            form: form.form,
            location: studioLocation,
            subexport: form.sub,
            js: params.js,
            css: params.css
          });

          // inject html as we don't have a server to serve html to phantom
          page.setContent(html, null)
            .then(function(status) {
              logger.debug('content set. status', status);

              var file = path.join(params.pdfExportDir, form.sub.formSubmittedAgainst._id + '_' + form.sub._id + '_' + generationTimestamp + '.pdf');
              page.render(file)
                .then(function() {
                  logger.info('Rendered pdf:', {file: file});
                  page.close();
                  page = null;

                  destroyPhantomSession(session, function() {
                    return cb(null, file);
                  });
                });
            });
        });
    })
    .catch(function(e1) {
      logger.error('Exception rendering pdf', {exception: e1});
      try {
        if (page) {
          page.close();
        }
      } catch (e2) {
        // silent
        logger.warn('Error closing page after phantom exception', {exception: e2});
      }
      return cb('Exception rendering pdf:' + e1.toString());
    });
}

/**
 * Rendering The HTML Template To A PDF Document
 * @param params
 *  - template
 *  - session
 *  - form
 *  - submission
 *  - location
 *  - generationTimestamp
 * @param cb
 * @returns {*}
 * @private
 */
module.exports = function renderPdf(params, cb) {

  logger.debug('renderPDF renderPdf ', params);

  //First, loading any css or javascript required to render the PDF
  getCssForPDF(function(err, cssJsValues) {
    if (err) {
      logger.error(err, "Error reading CSS and JS files for rendering PDFs");
      return cb(err);
    }

    renderPDF(_.extend(cssJsValues, params), cb);
  });
};