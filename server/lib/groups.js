/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util        = require('util'),
      _           = require('underscore'),
      db          = require('./db/groups-json');



exports.search = function(config, done) {
  db.search(config, function(err, found_groups) {
    if (err) {
      done && done(err, null);
      return;
    }

    found_groups.forEach(function(group) {
      // for security, set the is_member flag but remove the list of members
      group.is_member = false;
      if (group.members && config.user && config.user.email) {
        group.is_member = group.members.indexOf(config.user.email) > -1;
      }

      delete group.members;
    });

    done && done(null, found_groups);
  });
};

exports.update_user_groups = function(config, done) {
  var groups_to_add = config.groups || [];
  var email = config.email;

  db.search({}, function(err, found_groups) {
    var all_groups = _.pluck(found_groups, 'name');
    var groups_to_remove = _.difference(all_groups, groups_to_add) || [];

    exports.add_user_to_groups({
      groups: groups_to_add || [],
      email: email
    }, function(err, status) {
      exports.remove_user_from_groups({
        groups: groups_to_remove,
        email: email
      }, done);
    });
  });
};

exports.add_user_to_groups = function(config, done) {
  var groups_to_update = config.groups;
  var email = config.email;

  var updateGroup = function() {
    var group_name = groups_to_update.shift();
    if (group_name) {
      db.search({ name: group_name }, function(err, found_groups) {
        var group = found_groups[0];

        if (!group.members || group.members.indexOf(email) === -1) {
          group.members = group.members || [];
          group.members.push(email);
          groups.save(group, updateGroup);
        }
        else {
          updateGroup();
        }
      });
    }
    else {
      done(null, true);
    }
  };

  updateGroup();
};

exports.remove_user_from_groups = function(config, done) {
  var groups_to_update = config.groups;
  var email = config.email;

  var updateGroup = function() {
    var group_name = groups_to_update.shift();
    if (group_name) {
      db.search({ name: group_name }, function(err, found_groups) {
        var group = found_groups[0];

        var index = group.members && group.members.indexOf(email);
        if(index > -1) {
          group.members = group.members || [];
          group.members.splice(index, 1);
          groups.save(group, updateGroup);
        }
        else {
          updateGroup();
        }
      });
    }
    else {
      done(null, true);
    }
  };

  updateGroup();
};

exports.clear = db.clear;
exports.save = db.save;
