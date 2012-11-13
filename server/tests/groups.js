/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('assert'),
      groups          = require('../lib/groups');

var suite = vows.describe("groups");
suite.addBatch({
  'search of group that user is a member of': {
    topic: function() {
      var cb = this.callback;
      groups.clear(function() {
        groups.save({ name: 'group1', members: ["user1@testuser.com"] }, function(err, done) {
          groups.search({ name: "group1", user: { email: 'user1@testuser.com' } }, cb);
        });
      });
    },

    'sets group\'s is_member to true': function(found_groups) {
      var group = found_groups[0];
      assert.equal(group.is_member, true);
    }
  }
})

suite.addBatch({

  'search of group that user is not a member of': {
    topic: function() {
      var cb = this.callback;
      groups.clear(function() {
        groups.save({ name: 'group2', members: ["user1@testuser.com"] }, function(err, done) {
          groups.search({ name: "group2", user: { email: 'user2@testuser.com' } }, cb);
        });
      });
    },

    'sets group\'s is_member to false': function(found_groups) {
      var group = found_groups[0];
      assert.equal(group.is_member, false);
    }

  }
}).export(module);



