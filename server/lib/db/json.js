/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path     = require('path'),
      fs       = require('fs'),
      db_path  = require('../../etc/config').json_db_path;


exports.create = function(done) {
  fs.exists(db_path, function(exists) {
    if (!exists) {
      fs.writeFile(db_path, JSON.stringify({}), 'utf8', done);
    }
    else {
      done && done(null);
    }
  });
};

exports.get = function(options, done) {
  fs.exists(db_path, function(exists) {
    if (exists) {
      fs.readFile(db_path, function(err, data) {
        if (err) {
          done(err, null);
          return;
        }

        try {
          var jsonData = JSON.parse(data || "{}");
          if (options.key) {
            done(null, (jsonData && jsonData[options.key]) || {});
          }
          else {
            done(null, jsonData || {});
          }
        }
        catch(e) {
          console.log(String(e));
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
      done && done(err, !err);
    });
  });
};

