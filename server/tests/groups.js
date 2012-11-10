/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const vows            = require('vows'),
      assert          = require('assert'),
      groups          = require('../lib/db/groups-json'),
      DBMock          = require('./mocks/json_db');

var dbMock = new DBMock();
groups.init({
  db: dbMock
});

dbMock.save({
  key: 'groups',
  data: {
    group1: {
      name: 'group1',
      members: ["user1@testuser.com"]
    }
  }
});

vows.describe("groups").addBatch({
  'search of unavailble group': {
    topic: function() {
      groups.search({ name: 'unknown' }, this.callback);
    },

    'returns empty array': function(groups) {
      assert.equal(groups.length, 0);
    }
  },

  'search of available group': {
    topic: function() {
      groups.search({ name: "group1" }, this.callback);
    },

    'returns the group': function(groups) {
      assert.equal(groups[0].name, 'group1');
    }
  },

  'save a group': {
    topic: function() {
      groups.save({ name: 'group2', members: [ 'user2@testuser.com' ] }, this.callback);
    },

    'allows the group to be searched for': {
      topic: function(status) {
        assert.equal(status, true);

        groups.search({ name: 'group2' }, this.callback);
      },

      'and found': function(groups) {
        assert.equal(groups[0].name, 'group2');
        assert.equal(groups[0].members[0], 'user2@testuser.com');
      }
    }
  },

  'search without a group name': {
    topic: function() {
      groups.search({}, this.callback);
    },

    'returns all the groups': function(groups) {
      assert.equal(groups.length, 2);
    }
  }
}).export(module);

