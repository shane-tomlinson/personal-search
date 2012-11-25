/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// take care of crawling a GitHub repo's issues.


const github      = require('github');

exports.get = function(user, repo, done) {
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
      done && done(err);
      return;
    }

    issues = issues.concat(res);
    if (client.hasNextPage(res)) {
      client.getNextPage(res, appendResults);
    }
    else {
      done && done(null, issues);
    }
  }
};

