/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const web_crawler = require('./crawlers/web-crawler.js'),
      pages       = require('./pages'),
      url         = require('url');

var visited = {};
function shouldIndex(parsedRoot, parsedLink) {
  try {
    var rootHostname = parsedRoot.hostname.replace(/^www\./, '');
    var linkHostname = parsedLink.hostname.replace(/^www\./, '');

    // link MUST be on the same host and a sub-path of the current path
    if (linkHostname === rootHostname) {
      // If the rootPath is index.html(or .htm), then it *is* the root document
      // for the directory. Get rid of the index.html so we know whether to
      // look at the new document or not.
      var rootPath = parsedRoot.pathname.replace(/index\.htm[l]?/, '')
        .replace(/^\//, '')
        .replace(/\/$/, '') + "/";
      var linkPath = "/" + parsedLink.pathname.replace(/^\//, '').replace(/\/$/, '');

      return linkPath !== rootPath && linkPath.indexOf(rootPath) === 0;
    }
  } catch(e) {}

  return false;
}


exports.index = function(page_url, done) {
  if (visited[page_url]) {
    console.log('already visited:', page_url);
    done && done(null, null);
    return;
  }

  web_crawler.get(page_url, function(err, page) {
    visited[page_url] = true;

    if (err) {
      done && done(err, null);
      return;
    }

    pages.save(page, function(err, page) {
      if (err) {
        done && done(err, null);
        return;
      }

      var parsedRoot = url.parse(page_url);
      /*.hostname.replace(/^www\./, '');*/
      var links = [].concat(page.links);

      function getNextLink() {
        var link = links.shift();

        if (link) {

          if (shouldIndex(parsedRoot, url.parse(link))) {
            // follow internal links if they are not already in the database.
            pages.search({ url: link }, function(err, pages) {
              if (!(pages && pages[link])) {
                /*console.log('following link: ' + link);*/
                exports.index(link, getNextLink);
              }
              else {
                /*console.log('page already indexed: ' + link);*/
                getNextLink();
              }
            });
          }
          else {
            /*console.log("should not index: " + link);*/
            getNextLink();
          }
        }
        else {
          done && done(null, true);
        }
      }

      getNextLink();
    });
  });
};


