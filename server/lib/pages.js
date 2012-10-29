/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path     = require('path'),
      fs       = require('fs'),
      url      = require('url'),
      var_path = require('./constants').var_path,
      db_path  = path.join(var_path, "pages.json");

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
        'words', 'summary', 'title', 'url', 'users'
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
    console.log("match", url);
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

    if(page.users && page.users.indexOf(user) > -1) {
      matches[url] = page;
    }
  }

  done(null, matches);
}

function toSearchTerms(search_string) {
  return search_string.trim().replace(/\s+/, ' ').toLowerCase().split(' ');
}

function sortPages(options, pages, done) {
  if (options.terms) {
    var terms = toSearchTerms(options.terms);
    // only one of the following can count
    // 10 for url hostname match
    // 9 for url hostname match without www if url has a www.
    // 7 for url path match
    // 5 for each word in partial hostname match

    // any of these can count at any time
    // 4 for each work in title
    // 3 for each word match in text

    // first rank the pages
    pages.forEach(function(page, index) {
      var parsedURL = url.parse(page.url);
      var parsedURLWithoutWWW = url.parse(page.url.replace(/^www\./, ''));
      var hasWWW = parsedURL.hostname !== parsedURLWithoutWWW.hostname;

      page.ranking = 0;

      terms.forEach(function(term) {
        if (term === parsedURL.hostname) page.ranking += 10;
        else if (hasWWW && term === parsedURLWithoutWWW.hostname) page.ranking += 9;
        else if (parsedURL.pathname && parsedURL.pathname.toLowerCase().indexOf(term) > -1) page.ranking += 7;
        else if (parsedURL.hostname.indexOf(term) > -1) page.ranking += 5;

        if (page.title.toLowerCase().indexOf(term) > -1) page.ranking += 4;

        if (page.words.indexOf(term) > -1) page.ranking += 3;
      });
    });

    // then sort the pages. BubbleSort, super slow. Yuck. Do a merge sort or
    // something while creating the rankings.
    pages.sort(function(a, b) {
      return b.ranking - a.ranking;
    });

    done(null, pages);

  }
  else {
    done(null, pages);
  }
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
          var pagesArray = [];
          for(var key in pages) {
            pagesArray.push(pages[key]);
          }

          sortPages(options, pagesArray, done);
        });
      });
    });
  });
};
