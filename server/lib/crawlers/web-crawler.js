/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsdom      = require('jsdom'),
      url        = require('url'),
      path       = require('path'),
      page_get   = require('../get-page');

const commonContentElements = [
  "#main-content",
  "#content-main",
  "#api-content",
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
  console.log("getting", resource_url);
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
      var text = contentElement.innerHTML.replace(/<(.*?)>/g, ' ')
          // the next two are because after replacing tags with spaces, sometimes
          // there are spaces and then punctuation marks
          .replace(' .', '.')
          .replace(' ,', ',')
          .replace(/<!--[\s\S]*?-->/g, ' ')
          .replace('&nbsp', ' ')
          .replace(/\s+/g, ' ').trim();

      /*console.log(text);*/

      var textWithoutPunctuation = text.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
      var words = getWords(textWithoutPunctuation);

      done(null, {
        processing_time: new Date() - start,
        text: textWithoutPunctuation,
        words: words,
        summary: text.substr(0, 1000),
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
  var parsedURL = url.parse(resource_url);
  var localFile = "file://" + __filename;
  var localDir = "file://" + __dirname;

  for (var element, index=0; index < count; index++) {
    element = els[index];
    // jsdom has a bug where links can be converted to file:/// links.
    // hash only links without a host are converted to file:/// links with
    // the local filename absolute path links are converted to file:///
    // get rid of any of these as well as any hashes.
    // If the resource_url ends in a /, it will prepend the localDir onto the
    // URL.
    var href = element.href.replace(localFile, '')
                .replace(localDir, '')
                .replace(/file:\/\/\//, '/')
                .replace(/#.*/g, '');


    if (href) {
      // if there are still file://, that means this is a protocol relative
      // URL. swap the file:// for the current resource_url's protocol.
      if (/^file:\/\//.test(href)) href = href.replace(/^file:\/\//, parsedURL.protocol + "//");
      // handle absolute path URLs
      else if(/^\//.test(href)) {
        // If the original resource_url has a trailing /, jsdom will drop the
        // path of the original URL. Add the protocol, host, and path.
        if (/\/$/.test(resource_url)) {
          href = (parsedURL.protocol + "//" + parsedURL.host + parsedURL.pathname + href.replace(/^\//, ''));
        }
        else {
          // no trailing slash, just add the protocol and hostname
          href = (parsedURL.protocol + "//" + parsedURL.host + href);
        }
      }

      /*console.log(element.href, "->\n\t", href);*/
      anchors[href] = true;
    }
  }

  return Object.keys(anchors);
}

function getWords(text) {
  var words = {};
  var wordArray = text.split(' ');
  wordArray.forEach(function(word) {
    words[word.toLowerCase()] = true;
  });

  return Object.keys(words);
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

