/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const vows            = require('vows'),
      assert          = require('assert'),
      pages           = require('../lib/db/pages-json');


var suite = vows.describe("pages basic").export(module);


suite.addBatch({
  'initializing the database': {
    topic: function() {
      pages.init({}, this.callback);
    },

    'initializes with no error': function(err, resp) {
      assert.equal(err, null);
    }
  }
});

suite.addBatch({
  'adding a page': {
    topic: function() {
      var cb = this.callback;
      pages.init({}, function() {
        pages.save({
          url: 'http://url1.com',
          title: 'first page summary',
          words: ["biz", "baz", "bar", "buz"],
          summary: "biz baz bar baz baz bar biz buz",
          users: ["user1@testuser.com"],
          groups: ["group1"]
        }, function(err, page) {
          setTimeout(function() {
            cb(err, page);
          }, 1000);
        });
      });
    },

    'saves the page': function(err, page) {
      assert.equal(err, null);
      assert.ok(page);
    }
  }
});

suite.addBatch({
  'search for page by email': {
     topic: function() {
       pages.search({
         user: {
           email: 'user1@testuser.com'
         }
       }, this.callback);
     },

    'finds the page': function(err, pages) {
      assert.equal(err, null);
      assert.equal(pages.length, 1);
    }
  }
});

suite.addBatch({
  'search for page by terms': {
    topic: function() {
      pages.search({
        terms: "biz buz"
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
  'save a second page': {
    topic: function() {
      var cb = this.callback;
      pages.save({
        url: 'http://url2.com',
        title: 'second page summary',
        words: ["biz", "baz", "bar"],
        summary: "baz biz bar baz baz bar biz",
        users: ["user2@testuser.com"],
        groups: ["group1", "group2"]
      }, function(err) {
        setTimeout(function() {
          cb(err);
        }, 1000);
      });
    },

    'saves the page': function(err, page) {
      assert.equal(err);
    },

    'allows the page to be found': {
      topic: function() {
        var cb = this.callback;
        pages.search({ url: 'http://url2.com' }, this.callback);
      },

      'and found': function(err, found_pages) {
        assert.equal(err, null);
        assert.ok(found_pages.length, 1);
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

});

suite.addBatch({
  'search of user with no pages': {
    topic: function() {
      var cb = this.callback;
      pages.search({ user: { email: 'unknown@testuser.com' } }, cb);
    },

    'returns empty array': function(found_pages) {
      assert.equal(found_pages.length, 0);
    }
  }
});

suite.addBatch({
  'reset': {
    topic: function() {
      pages.reset(this.callback);
    },
    'will reset the database': function(err, resp) {
      assert.equal(err, null);
    }
  }
});

