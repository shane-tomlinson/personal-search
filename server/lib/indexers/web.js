/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const web_crawler = require('../crawlers/web.js'),
      url         = require('url');

var pages;

exports.init = function(config, done) {
  config = config || {};

  done && done(null);
};

/**
 * Recursively index web pages starting from page_url.
 * @method index
 * @param {string} page_url
 * @param {string} user
 * @param {boolean} force
 * @param {function} done
 */
exports.index = function(page_url, user, force, done, pages) {
  var pages = pages || [];
  web_crawler.get(page_url, function(err, page) {
    if (err) {
      return (done && done(err, null));
    }

    // save the page
    pages.push(page);

    // get any children
    console.log("saving page", page_url);
    var parsedRoot = url.parse(page_url);
    var links = [].concat(page.links);
    getNextLink();

    function getNextLink() {
      var link = links.shift();

      if (link) {
        if (shouldIndex(parsedRoot, url.parse(link))) {
          console.log('following link: ' + link);
          exports.index(link, user, force, getNextLink, pages);
        }
        else {
          /*console.log("should not index: " + link);*/
          getNextLink();
        }
      }
      else {
        done && done(null, pages);
      }
    }
  });
};

function shouldIndex(parsedRoot, parsedLink) {
  try {
    var rootHostname = parsedRoot.hostname.replace(/^www\./, '');
    var linkHostname = parsedLink.hostname.replace(/^www\./, '');

    /*console.log(rootHostname, linkHostname);*/

    // link MUST be on the same host and a sub-path of the current path
    if (linkHostname === rootHostname) {
      // If the rootPath is index.html(or .htm), then it *is* the root document
      // for the directory. Get rid of the index.html so we know whether to
      // look at the new document or not.
      var rootPath = parsedRoot.pathname.replace(/index\.htm[l]?/, '');
      var linkPath = parsedLink.pathname;

      return linkPath !== rootPath && linkPath.indexOf(rootPath) === 0;
    }
  } catch(e) {}

  return false;
}



