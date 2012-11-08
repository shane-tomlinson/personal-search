/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs'),
      _             = require('underscore'),
      page_rank     = require('./page-rank');

var db;

exports.init = function(config, done) {
  db = config.db;
  done && done();
};

function getPages(done) {
  db.get({ key: 'pages' }, done);
}

function savePages(pages, done) {
  db.save({ key: 'pages', data: pages }, done);
}

function whitelistFilter(obj, itemsToAllow) {
  return _.pick(obj, itemsToAllow);
}

exports.save = function(page, done) {
  getPages(function(err, pages) {
    if (err) {
      done(err, null);
    }
    else {
      pages[page.url] = whitelistFilter(page, [
        'words', 'summary', 'title', 'users', 'groups'
      ]);

      savePages(pages, function(err, status) {
        if (err) done(err, null);
        else done(null, status === true ? page : status);
      });
    }
  });
};

function filterPagesForString(pages, search_string, done) {
  if (!search_string) {
    done(null, pages);
    return;
  }

  var terms = toSearchTerms(search_string);
  var matches = {};

  for(var url in pages) {
    var page = pages[url];

    var match = true;

    terms.forEach(function(term) {
      // word can either be in the URL or in the main body of text.
      if (page.words.indexOf(term) === -1 && page.url.indexOf(term) === -1) match = false;
    });

    if (match) matches[url] = page;
  }

  done(null, matches);
}

function filterPagesForURL(pages, url, done) {
  if (!url) {
    done(null, pages);
    return;
  }

  var matches = null;

  if (pages[url]) {
    matches = {};
    matches[url] = pages[url];
  }

  done(null, matches);
}

function filterPagesForUser(pages, user, done) {
  if (!user) {
    done(null, pages);
    return;
  }

  var matches = {};

  for (var url in pages) {
    var page = pages[url];

    if(page.users && page.users.indexOf(user.email) > -1) {
      matches[url] = page;
    }
    else if(page.groups && user.groups) {
      var matchingGroups = _.intersection(page.groups, page.groups);
      if (matchingGroups && matchingGroups.length) {
        matches[url] = page;
      }
    }
  }

  done(null, matches);
}

function toSearchTerms(search_string) {
  return search_string && search_string.trim().replace(/\s+/, ' ').toLowerCase().split(' ');
}

function sortPages(options, pages, done) {
  var terms = toSearchTerms(options.terms);
  page_rank.sortByRank(pages, options, done);
}

exports.search = function(options, done) {
  getPages(function(err, pages) {
    if(err) {
      done(err, null);
      return;
    }

    filterPagesForURL(pages, options.url, function(err, pages) {
      filterPagesForUser(pages, options.user, function(err, pages) {
        filterPagesForString(pages, options.terms, function(err, pages) {
          sortPages(options, _.values(pages), done);
        });
      });
    });
  });
};
