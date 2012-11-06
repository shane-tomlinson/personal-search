/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.sortByRank = function(pages, terms, done) {
  if (terms) {
    // only one of the following can count
    // 10 for url hostname match
    // 9 for url hostname match without www if url has a www.
    // 7 for url path match
    // 5 for each word in partial hostname match

    // any of these can count at any time
    // 4 for each work in title
    // 3 for each word match in text

    console.log("pages before", pages);
    // first rank the pages
    pages.forEach(function(page, index) {
      page.ranking = rank(page, terms);
    });

    // then sort the pages. BubbleSort, super slow. Yuck. Do a merge sort or
    // something while creating the rankings.
    pages.sort(function(a, b) {
      return b.ranking - a.ranking;
    });

    console.log(pages);
    done(null, pages);

  }
  else {
    done(pages);
  }
};

function rank(page, terms) {
  // only one of the following can count
  // 10 for url hostname match
  // 9 for url hostname match without www if url has a www.
  // 7 for url path match
  // 5 for each word in partial hostname match

  // any of these can count at any time
  // 4 for each work in title
  // 3 for each word match in text

  var parsedURL = url.parse(page.url);
  var parsedURLWithoutWWW = url.parse(page.url.replace(/^www\./, ''));
  var hasWWW = parsedURL.hostname !== parsedURLWithoutWWW.hostname;

  var ranking = 0;

  terms.forEach(function(term) {
    if (term === parsedURL.hostname) ranking += 10;
    else if (hasWWW && term === parsedURLWithoutWWW.hostname) ranking += 9;
    else if (parsedURL.pathname && parsedURL.pathname.toLowerCase().indexOf(term) > -1) ranking += 7;
    else if (parsedURL.hostname.indexOf(term) > -1) ranking += 5;

    if (page.title.toLowerCase().indexOf(term) > -1) ranking += 4;

    if (page.words.indexOf(term) > -1) ranking += 3;
  });

  return ranking;
};
