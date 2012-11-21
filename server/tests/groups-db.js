/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const vows            = require('vows'),
      assert          = require('assert'),
      groups          = require('../lib/db/groups-json');

var suite = vows.describe("groups database");
suite.addBatch({
  'search of unavailble group': {
    topic: function() {
      var cb = this.callback;
      groups.clear(function() {
        groups.search({ name: 'unknown' }, cb);
      });
    },

    'returns empty array.': function(found_groups) {
      assert.equal(found_groups.length, 0);
    }
  }
});

suite.addBatch({
  'Saving a new group': {
    topic: function() {
      var cb = this.callback;
      groups.save({ name: 'group1', members: ["user1@testuser.com"] }, function(err, done) {
        groups.search({ name: "group1" }, cb);
      });
    },

    'allows the group to be found.': function(found_groups) {
       assert.equal(found_groups[0].name, 'group1');
    }
  }
});

suite.addBatch({
  'After adding a second group, the original group': {
    topic: function() {
      var cb = this.callback;
      groups.save({ name: 'group2', members: [ 'user2@testuser.com' ] }, function(err, status) {
        groups.search({ name: 'group1' }, cb);
      });
    },

    'can still be found': function(found_groups){
      assert.equal(found_groups.length, 1);
    }
  }
});

suite.addBatch({
  'along with': {
    topic: function() {
      groups.search({ name: 'group2' }, this.callback);
    },

    'the new group': function(found_groups) {
      assert.equal(found_groups.length, 1);
    }
  }
});

suite.addBatch({
  'searching without a group name': {
    topic: function() {
      groups.search({}, this.callback);
    },

    'finds all the groups': function(found_groups) {
      assert.equal(found_groups.length, 2);
    }
  }
});

suite.export(module);

