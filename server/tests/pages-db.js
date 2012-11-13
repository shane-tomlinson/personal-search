/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const vows            = require('vows'),
      assert          = require('assert'),
      pages           = require('../lib/db/pages-json');

var suite = vows.describe("pages basic");
suite.addBatch({
  'search of user with no pages': {
    topic: function() {
      var cb = this.callback;
      pages.clear(function() {
        pages.search({ user: { email: 'unknown@testuser.com' } }, cb);
      });
    },

    'returns empty array': function(found_pages) {
      assert.equal(found_pages.length, 0);
    }
  }
});

suite.addBatch({
  'search of user with pages': {
    topic: function() {
      var cb = this.callback;
      pages.save({
        url: 'http://url1.com',
        title: 'first page summary',
        words: ["biz", "baz", "bar"],
        summary: "biz baz bar baz baz bar biz",
        users: ["user1@testuser.com"],
        groups: ["group1"]
      }, function() {
        pages.search({
          user: {
            email: 'user1@testuser.com'
          }
        }, cb);
      });
    },

    'finds the user\'s pages': function(found_pages) {
      assert.equal(found_pages.length, 1);
    }
  }
});

suite.addBatch({
  'search for page by terms': {
    topic: function() {
      pages.search({
        terms: "biz baz"
      }, this.callback);
    },

    'returns the page': function(found_pages) {
      assert.equal(found_pages.length, 1);
    }
  }
});

suite.addBatch({

  'search for page by url': {
    topic: function() {
      pages.search({ url: "http://url1.com" }, this.callback);
    },

    'returns the page': function(found_pages) {
      assert.equal(found_pages.length, 1);
    }
  }
});

suite.addBatch({
  'save a page': {
    topic: function() {
      pages.save({
        url: 'http://url2.com',
        title: 'second page summary',
        words: ["biz", "baz", "bar"],
        summary: "baz biz bar baz baz bar biz",
        users: ["user2@testuser.com"],
        groups: ["group1", "group2"]
      }, this.callback);
    },

    'allows the page to be searched for': {
      topic: function(page) {
        assert.equal(page.url, 'http://url2.com');

        pages.search({ url: 'http://url2.com' }, this.callback);
      },

      'and found': function(found_pages) {
        assert.equal(found_pages.length, 1);
      }
    }
  }
});

suite.addBatch({

  'search for pages that match groups': {
    topic: function() {
      pages.search({ user: { email: "unknown@testuser.com", groups: ["group1"] } }, this.callback);
    },

    'finds pages shared with the user\'s group': function(found_pages) {
      assert.equal(found_pages.length, 2);
    }
  }

}).export(module);

