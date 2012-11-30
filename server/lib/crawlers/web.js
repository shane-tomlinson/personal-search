/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsdom           = require('jsdom'),
      url             = require('url'),
      path            = require('path'),
      page_get        = require('../get-page'),
      post_process    = require('./post-process');

const commonContentElements = [
  "#main-content",
  "#content-main",
  "#api-content",
  ".api-content",
  "#apicontent",
  ".apicontent",
  "#docs-content",
  "#content",
  "#contents",
  "#main",
  "#articles",
  ".content",
  ".contents",
  ".main",
  ".tab-content",
  ".articles"
];

// get rid of scripts, links and iframes
const elementsToRemove = [
  "script",
  "link",
  "iframe",
  "nav",
  "#nav",
  ".nav",
  "#navigation",
  ".navigation",
  "#breadcrumbs",
  ".breadcrumbs",
  "#jump-to",
  ".jump-to",
  "#jump-to-nav",
  ".jump-to-nav",
  "#sidebar",
  ".sidebar",
  "#guide_sidebar",
  ".guide_sidebar"
];


exports.get = function(resource_url, done) {
  page_get.get(resource_url, null, function(err, info) {
    if (err) {
      done(err, null);
      return;
    }
    else if (info.statusCode !== 200) {
      done(new Error("Invalid HTTP response " + info.statusCode), null);
      return;
    }

    exports.getInfo(resource_url, info.body, done);
  });
};

exports.getInfo = function(resource_url, html, done) {
  jsdom.env({
    html: html,
    features: {
      QuerySelector: true,
      FetchExternalResources: false,
      MutationEvents: false,
      ProcessExternalResources: false
    },
    done: function(err, window) {
      if (err) {
        done(err, null);
        return;
      }

      var start = new Date();

      // get links before any elements are removed
      var links = getAnchors(resource_url, window);

      // get rid of scripts, links and iframes
      elementsToRemove.forEach(function(element) {
        removeElements(window, element);
      });

      var contentElement = getContentElement(window);

      // strip all tags, replace tags with a space.
      // strip all multiple whitespace occurrances with a single space
      var textInfo = post_process.process(contentElement.innerHTML);
      done(null, {
        processing_time: new Date() - start,
        text: textInfo.text_no_punctuation,
        words: textInfo.words,
        summary: textInfo.text_clean.substr(0, 1000),
        title: window.document.title,
        url: resource_url,
        links: links
      });
    }
  });
};

function removeElements(window, type) {
  var els = window.document.querySelectorAll(type);
  var count = els && els.length;
  for (var element, index=0; index < count; index++) {
    element = els[index];
    element.parentNode.removeChild(element);
  }
}

function getAnchors(resource_url, window) {
  var els = window.document.body.getElementsByTagName("a");
  var count = els && els.length;
  var anchors = {};
  var localFile = "file://" + __filename;
  var localDir = "file://" + __dirname + '/';

  for (var element, index=0; index < count; index++) {
    element = els[index];
    // jsdom does some funkiness on links that do not have an explicit
    // protocol.
    //
    // relative links will have the localFile or localDir prepended.
    // absolute links will have a file:/// prepended
    // protocol relative links will have a file:// prepended.
    var href = element.href.replace(localFile, '')
                .replace(localDir, '')
                // get rid of any trailing hashes.
                .replace(/#.*$/, '')
                // file:/// are absolute paths
                .replace(/^file:\/\/\//, '/')
                // file:// are protocol relative URLs
                .replace(/^file:\/\//, "//");

    if (href) {
      href = url.resolve(resource_url, href);
      anchors[href] = true;
    }
  }

  return Object.keys(anchors);
}

function getContentElement(window) {
  for(var i = 0, elementToSearchFor; elementToSearchFor = commonContentElements[i]; ++i) {
    var element = window.document.querySelector(elementToSearchFor);
    if (element) {
      return element;
    }
  }

  return window.document.body;
}

