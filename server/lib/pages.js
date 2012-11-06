/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path          = require('path'),
      fs            = require('fs'),
      url           = require('url'),
      page_rank     = require('./page-rank'),
      var_path      = require('./constants').var_path,
      db_path       = path.join(var_path, "pages.json");

function getPages(done) {
  fs.exists(db_path, function(exists) {
    if (exists) {
      fs.readFile(db_path, function(err, data) {
        if (err) {
          done(err, null);
          return;
        }

        try {
          done(null, JSON.parse(data));
        }
        catch(e) {
          done(e, null);
        }
      });
    }
    else {
      done(null, {});
    }
  });
}

function savePages(pages, done) {
  fs.writeFile(db_path, JSON.stringify(pages), 'utf8', function(err) {
    if (err) done(err, null);
    else done(null, true);
  });
}

exports.init = function(done) {
  done();
};

function whitelistFilter(obj, itemsToAllow) {
  var newObj = {};
  itemsToAllow.forEach(function(item) {
    if (item in obj) newObj[item] = obj[item];
  });
  return newObj;
}

exports.save = function(page, done) {
  getPages(function(err, pages) {
    if (err) {
      done(err, null);
    }
    else {
      pages[page.url] = whitelistFilter(page, [
        'words', 'summary', 'title', 'url'
      ]);

      savePages(pages, function(err, status) {
        if (err) done(err, null);
        else done(null, status === true ? page : status);
      });
    }
  });
};

function matchStringInPages(pages, search_string, done) {
  if (!search_string) {
    done(null, pages);
    return;
  }

  var terms = toSearchTerms(search_string);
  var matches = [];

  for(var url in pages) {
    var page = pages[url];

    var match = true;

    terms.forEach(function(term) {
      // word can either be in the URL or in the main body of text.
      if (page.words.indexOf(term) === -1 && page.url.indexOf(term) === -1) match = false;
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

function toSearchTerms(search_string) {
  return search_term && search_string.trim().replace(/\s+/, ' ').toLowerCase().split(' ');
}

function sortPages(options, pages, done) {
  var terms = toSearchTerms(options.terms);
  page_rank.sortByRank(pages, terms, done);
}

exports.search = function(options, done) {
  getPages(function(err, pages) {
    if(err) {
      done(err, null);
      return;
    }

    filterPages(pages, options.url, function(err, pagesToSearch) {
      if(pagesToSearch) console.log('searching', Object.keys(pagesToSearch).length, 'pages');
      matchStringInPages(pagesToSearch, options.terms, function(err, pages) {
        sortPages(options, pages, done);
      });
    });
  });
};
