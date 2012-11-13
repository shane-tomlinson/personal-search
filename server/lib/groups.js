/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util        = require('util'),
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

exports.clear = db.clear;
exports.save = db.save;
