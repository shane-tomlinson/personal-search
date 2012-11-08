/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const url      = require('url');

var db;

function getGroups(done) {
  db.get({ key: 'groups' }, done);
}

function saveGroups(groups, done) {
  db.save({ key: 'groups', data: groups }, done);
}


exports.init = function(options, done) {
  db = options.db;

  done && done(null);
};

exports.search = function(config, done) {
  getGroups(function(err, groups) {
    if (err) {
      done && done(err);
      return;
    }

    var nameToFind = config.name;

    for (var name in groups) {
      var group = groups[name];
      if(group.name === nameToFind) {
        done && done(null, group);
        return;
      }
    }

    done && done(null, null);
  });
};

exports.save = function(group, done) {
  if (!group.name) {
    throw new Error("Group name must be defined");
  }

  getGroups(function(err, groups) {
    if (err) {
      done && done(err);
      return;
    }

    groups[group.name] = group;
    saveGroups(groups, done);
  });
};
