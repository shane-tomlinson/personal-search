/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('assert'),
      github_issues   = require('../../lib/crawlers/github-issues');

var suite = vows.describe("github_issues");
suite.export(module);

suite.addBatch({
  'get': {
    topic: function() {
      github_issues.get('shane-tomlinson', 'node-font-face-generator', this.callback);
    },

    'gets all the issues': function(err, issues) {
      assert.equal(err, null);
      assert.equal(Object.prototype.toString.call(issues), "[object Array]");
    }
  }
});

