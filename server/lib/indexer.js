/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const web_indexer       = require('./indexers/web'),
      github_indexer    = require('./indexers/github');

var pages;

exports.init = function(config, done) {
  pages = config.pages;

  web_indexer.init(config);
  github_indexer.init(config);

  done && done(null);
};

exports.index = function(page_url, user, force, done) {
  pages.search({ url: page_url }, function(err, saved_pages) {
    if (saved_pages.length && !force) {
      return addUserToPages(user, saved_pages, done);
    }

    index(page_url, user, force, done);
  });
};

function index(page_url, user, force, done) {
  var indexer = getIndexer(page_url);
  indexer(page_url, user, force, function(err, indexed_pages) {
    if (err) {
      return (done && done(err));
    }

    function saveNext(err) {
      if (err) return (done && done(err));

      var page = indexed_pages.shift();
      if (page) {
        page.users = [user];
        pages.save(page, saveNext);
      }
      else {
        done && done(null);
      }
    }
    saveNext();
  });
}

function getIndexer(page_url) {
  return /github\.com/.test(page_url) ? github_indexer.index : web_indexer.index;
}

function addUserToPages(user, saved_pages, done) {
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
}
