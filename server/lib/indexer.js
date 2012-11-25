/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const web_crawler = require('./crawlers/web-crawler.js'),
      url         = require('url');

var pages;

function shouldIndex(parsedRoot, parsedLink) {
  try {
    var rootHostname = parsedRoot.hostname.replace(/^www\./, '');
    var linkHostname = parsedLink.hostname.replace(/^www\./, '');

    console.log(rootHostname, linkHostname);

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


exports.init = function(config, done) {
  pages = config.pages;

  done && done(null);
};

exports.index = function(page_url, user, force, done) {
  pages.search({ url: page_url }, function(err, saved_pages) {
    console.log(saved_pages);
    if (saved_pages.length && !force) {
      var page = saved_pages[0];
      // see if this user is part of the page's user list. If not, add them to
      // the list.
      console.log(page);
      if (page.users.indexOf(user) === -1) {
        page.users.unshift(user);
        pages.save(page, function(err, page) {
          console.log('already visited, but updated user:', page_url);
          done && done(err, null);
        });
      }
      else {
        console.log('already visited, user already added:', page_url);
        done && done(null, null);
      }

      return;
    }

    web_crawler.get(page_url, function(err, page) {
      if (err) {
        done && done(err, null);
        return;
      }

      // make sure to keep original users as well.
      page.users = [ user ];
      if (saved_pages.length) {
        page.users.concat(saved_pages[0].users);
      }

      console.log("saving page", page_url);
      pages.save(page, function(err, page) {
        if (err) {
          console.log("error", err);
          done && done(err, null);
          return;
        }

        var parsedRoot = url.parse(page_url);
        var links = [].concat(page.links);
        getNextLink();

        function getNextLink() {
          var link = links.shift();

          if (link) {
            if (shouldIndex(parsedRoot, url.parse(link))) {
              console.log('following link: ' + link);
              exports.index(link, user, force, getNextLink);
            }
            else {
              console.log("should not index: " + link);
              getNextLink();
            }
          }
          else {
            done && done(null, true);
          }
        }

      });
    });
  });
};


