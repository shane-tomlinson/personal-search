/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('node-assert-extras'),
      github          = require('../../lib/indexers/github');

const repo_url = "https://github.com/shane-tomlinson/node-font-face-generator";

var suite = vows.describe("github indexer");
suite.export(module);

suite.addBatch({
  'parseURL with http repo page': {
    topic: github.parseURL(repo_url),

    'returns repo user and repo name': function(err, info) {
      assert.equal(info.user, 'shane-tomlinson');
      assert.equal(info.repo, 'node-font-face-generator');
    }
  }
});

suite.addBatch({
  'index': {
    topic: function() {
      github.init();
      github.index(repo_url, "testuser", false, this.callback);
    },

    'gets a github repo\'s issues': function(err, issues) {
      assert.equal(err, null);
      assert.isArray(issues);
    }
  }
});
