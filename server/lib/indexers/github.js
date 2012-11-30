/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const issues_crawler   = require('../crawlers/github-issues'),
      repo_crawler     = require('../crawlers/github-repo'),
      url              = require('url');

var pages;

exports.init = function(config, done) {
  config = config || {};

  done && done(null);
};

exports.index = function(repo_url, user, force, done) {
  var repoConfig = exports.parseURL(repo_url);

  if (repoConfig) {
    repo_crawler.get(repoConfig.user, repoConfig.repo, function(err, repo) {
      if (err) return (done && done(err));

      issues_crawler.get(repoConfig.user, repoConfig.repo, function(err, issues) {
        if (err) return (done && done(err));

        // the repo info should always be the first item in the list.
        done && done(null, [repo].concat(issues));
      });
    });
  }
  else {
    done && done(new Error("invalid repo URL"));
  }
};

exports.parseURL = function(page_url) {
  var parsedURL = url.parse(page_url);
  var path = parsedURL.path.replace(/\.git$/, '').replace(/^\//, '');

  var parts = path.split('/');
  if (parts.length === 2) {
    var user = parts[0];
    var repo = parts[1];

    return {
      user: user,
      repo: repo
    };
  }
};


