/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path     = require('path'),
      fs       = require('fs'),
      db_path  = require('../../etc/config').json_db_path;


exports.get = function(options, done) {
  fs.exists(db_path, function(exists) {
    if (exists) {
      fs.readFile(db_path, function(err, data) {
        if (err) {
          done(err, null);
          return;
        }

        try {
          var jsonData = JSON.parse(data);
          if (options.key) {
            done(null, jsonData[options.key]);
          }
          else {
            done(null, jsonData);
          }
        }
        catch(e) {
          done(e, null);
        }
      });
    }
    else {
      done(null, {});
    }
  });
};

exports.save = function(options, done) {
  exports.get({}, function(err, data) {
    data[options.key] = options.data;

    fs.writeFile(db_path, JSON.stringify(data), 'utf8', function(err) {
      if (err) done(err, null);
      else done(null, true);
    });
  });
};
