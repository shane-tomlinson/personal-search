/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path     = require('path'),
      fs       = require('fs'),
      var_path = require('./constants').var_path,
      db_path  = path.join(var_path, "pages.json");

var pages;

exports.init = function(done) {
  fs.exists(db_path, function(exists) {
    if (exists) {
      fs.readFile(db_path, function(err, data) {
        if (err) {
          done(err, null);
          return;
        }

        try {
          pages = JSON.parse(data);
          done(null, pages);
        }
        catch(e) {
          done(e, null);
        }
      });
    }
    else {
      pages = {};
      done(null, pages);
    }
  });
};

function whitelistFilter(obj, itemsToAllow) {
  var newObj = {};
  itemsToAllow.forEach(function(item) {
    if (item in obj) newObj[item] = obj[item];
  });
  return newObj;
}
exports.save = function(page, done) {
  pages[page.url] = whitelistFilter(page, [
    'words', 'summary', 'title', 'url'
  ]);

  fs.writeFile(db_path, JSON.stringify(pages), 'utf8', function(err) {
    done(null, page);
  });
};

function matchStringInPages(pages, search_string, done) {
  if (!search_string) {
    done(null, pages);
    return;
  }

  var terms = search_string.trim().replace(/\s+/, ' ').toLowerCase().split(' ');
  var matches = [];

  for(var url in pages) {
    var page = pages[url];

    var match = true;

    terms.forEach(function(term) {
      if (page.words.indexOf(term) === -1) match = false;
    });

    if (match) matches.push(page);
  }

  done(null, matches);
}

function filterPages(pages, url, done) {
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

exports.search = function(options, done) {
  filterPages(pages, options.url, function(err, pagesToSearch) {
    if(pagesToSearch) console.log('searching', Object.keys(pagesToSearch).length, 'pages');
    matchStringInPages(pagesToSearch, options.terms, done);
  });
};
