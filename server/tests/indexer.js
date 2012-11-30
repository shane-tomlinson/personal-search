/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('assert'),
      indexer         = require('../lib/indexer'),
      pages           = require('../lib/db/pages-json');

const sub_page_url = "http://www.shanetomlinson.com/about/"
const github_url = "https://github.com/shane-tomlinson/node-font-face-generator";

var suite = vows.describe("indexer");
suite.export(module);

pages.init();
indexer.init({
  pages: pages
});

suite.addBatch({
  'index on a web page': {
    topic: function() {
      indexer.index(sub_page_url, 'testuser', true, this.callback);
    },

    'indexes and saves pages': function(err) {
      assert.equal(err, null);
    }
  }
});

suite.addBatch({
  'index on a github page': {
    topic: function() {
      indexer.index(github_url, 'testuser', true, this.callback);
    },

    'indexes and saves the repo\'s issues': function(err) {
      assert.equal(err, null);
    }
  }
});

