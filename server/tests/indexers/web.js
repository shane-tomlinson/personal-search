/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('assert'),
      web_indexer     = require('../../lib/indexers/web'),
      pages           = require('../../lib/db/pages-json');

// XXX this should depend on a locally hosted file that can be
// controlled instead.
const root_url = "http://www.shanetomlinson.com/"
const sub_page_url = "http://www.shanetomlinson.com/about/"

var suite = vows.describe("web indexer");
suite.export(module);

suite.addBatch({
  'index on a sub page': {
    topic: function() {
      web_indexer.init();
      web_indexer.index(sub_page_url, "testuser", false, this.callback);
    },

    'gets only that sub-page': function(err, pages) {
      assert.equal(err, null);
      assert.isArray(pages);
      assert.equal(pages.length, 1);
    }
  }
});

suite.addBatch({
  'index on a root page': {
    topic: function() {
      web_indexer.init();
      web_indexer.index(root_url, "testuser", false, this.callback);
    },

    'indexes that page and any sub-pages': function(err, pages) {
      assert.equal(err, null);
      assert.isArray(pages);
      assert.ok(pages.length > 1);
    }
  }
});

