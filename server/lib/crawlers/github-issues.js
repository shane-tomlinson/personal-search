/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// take care of crawling a GitHub repo's issues.


const github      = require('github');

exports.get = function(user, repo, done) {
  var start = new Date();

  var client = new github({
    version: "3.0.0"
  });

  var issues = [];

  client.issues.repoIssues({
    user: user,
    repo: repo,
    sort: 'created',
    direction: 'asc',
    page: 0,
    per_page: 100
  }, appendResults);

  function appendResults(err, res) {
    if (err) {
      return (done && done(err));
    }

    res.forEach(function(issue) {
      var text = issue.body.replace(/<(.*?)>/g, ' ')
          // the next two are because after replacing tags with spaces, sometimes
          // there are spaces and then punctuation marks
          .replace(' .', '.')
          .replace(' ,', ',')
          .replace(/<!--[\s\S]*?-->/g, ' ')
          .replace('&nbsp', ' ')
          .replace(/\s+/g, ' ').trim();

      var textWithoutPunctuation = text.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
      var words = getWords(textWithoutPunctuation);

      issues.push({
        processing_time: new Date() - start,
        text: textWithoutPunctuation,
        words: words,
        summary: text.substr(0, 1000),
        title: issue.title,
        url: issue.html_url,
        links: []
      });
    });

    if (client.hasNextPage(res)) {
      client.getNextPage(res, appendResults);
    }
    else {
      done && done(null, issues);
    }
  }
};

function getWords(text) {
  var words = {};
  var wordArray = text.split(' ');
  wordArray.forEach(function(word) {
    words[word.toLowerCase()] = true;
  });

  return Object.keys(words);
}

