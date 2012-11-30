/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crawler   = require('../crawlers/github-issues'),
      url              = require('url');

var pages;

exports.init = function(config, done) {
  config = config || {};

  done && done(null);
};

exports.index = function(repo_url, user, force, done) {
  var repoInfo = exports.parseURL(repo_url);

  if (repoInfo) {
    crawler.get(repoInfo.user, repoInfo.repo, done);
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


