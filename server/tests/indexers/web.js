/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('assert'),
      web_indexer     = require('../../lib/indexers/web'),
      pages           = require('../../lib/db/pages-json');

// XXX this should depend on a locally hosted file instead.
const root_url = "http://www.shanetomlinson.com/about/"

var suite = vows.describe("web indexer");
suite.export(module);

suite.addBatch({
  'index': {
    topic: function() {
      web_indexer.init({ pages: pages });
      web_indexer.index(root_url, "testuser", false, this.callback);
    },

    'indexes a the page and any sub-pages': function(err) {
      assert.equal(err, null);
    }
  }
});

