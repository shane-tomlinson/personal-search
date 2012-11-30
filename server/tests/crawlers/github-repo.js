/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('node-assert-extras'),
      github_repo     = require('../../lib/crawlers/github-repo');

var suite = vows.describe("github_repo");
suite.export(module);

suite.addBatch({
  'get': {
    topic: function() {
      github_repo.get('shane-tomlinson', 'node-font-face-generator', this.callback);
    },

    'gets the readme': function(err, readme) {
      assert.equal(err, null);
      assert.equal("https://github.com/shane-tomlinson/node-font-face-generator", readme.url);
      assert.equal("shane-tomlinson/node-font-face-generator: Generate language/browser dependent @font-face CSS declarations", readme.title);
    }
  }
});

