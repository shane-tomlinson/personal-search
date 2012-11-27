/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const issues_crawler   = require('../crawlers/github-issues'),
      url              = require('url');

var pages;

exports.init = function(config, done) {
  config = config || {};

  pages = config.pages;
  done && done(null);
};

exports.index = function(page_url, user, force, done) {
  var info = exports.parseURL(page_url);

  if (info) {
    issues_crawler.get(info.user, info.repo, function(err, issues) {
      if (err) {
        return (done && done(err));
      }

      function saveNext(err) {
        if (err) return (done && done(err));

        var issue = issues.shift();
        if (issue) {
          issue.users = [user];
          pages.save(issue, saveNext);
        }
        else {
          done && done(null);
        }
      }
      saveNext();
    });
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


