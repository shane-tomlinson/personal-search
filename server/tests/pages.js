/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const vows            = require('vows'),
      assert          = require('assert'),
      pages           = require('../lib/db/pages-json'),
      DBMock          = require('./mocks/json_db');


var dbMock = new DBMock();
pages.init({
  db: dbMock
});

dbMock.save({
  key: 'pages',
  data: {
    url1: {
      url: 'url1',
      title: 'first page summary',
      words: ["biz", "baz", "bar"],
      summary: "biz baz bar baz baz bar biz",
      users: ["user1@testuser.com"],
      groups: ["group1"]
    }
  }
});

vows.describe("pages basic").addBatch({
  'search of user with no pages': {
    topic: function() {
      pages.search({ user: { email: 'unknown@testuser.com' } }, this.callback);
    },

    'returns empty array': function(found_pages) {
      assert.equal(found_pages.length, 0);
    }
  },

  'search of user with pages': {
    topic: function() {
      pages.search({
        user: {
          email: 'user1@testuser.com'
        }
      }, this.callback);
    },

    'finds the user\'s pages': function(found_pages) {
      assert.equal(found_pages.length, 1);
    }
  },

  'search for page by terms': {
    topic: function() {
      pages.search({
        terms: "biz baz"
      }, this.callback);
    },

    'returns the page': function(found_pages) {
      assert.equal(found_pages.length, 1);
    }
  },

  'search for page by url': {
    topic: function() {
      pages.search({ url: "url1" }, this.callback);
    },

    'returns the page': function(found_pages) {
      assert.equal(found_pages.length, 1);
    }
  },

  'save a page': {
    topic: function() {
      pages.save({
        url: 'url2',
        title: 'second page summary',
        words: ["biz", "baz", "bar"],
        summary: "baz biz bar baz baz bar biz",
        users: ["user2@testuser.com"],
        groups: ["group1", "group2"]
      }, this.callback);
    },

    'allows the page to be searched for': {
      topic: function(page) {
        assert.equal(page.url, 'url2');

        pages.search({ url: 'url2' }, this.callback);
      },

      'and found': function(found_pages) {
        assert.equal(found_pages.length, 1);
      }
    }
  },

  'search for pages that match groups': {
    topic: function() {
      pages.search({ user: { email: "unknown@testuser.com", groups: ["group1"] } }, this.callback);
    },

    'finds pages shared with the user\'s group': function(found_pages) {
      assert.equal(found_pages.length, 2);
    }
  }

}).export(module);

