/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * get a web page
 */

const request = require('request');

exports.get = function(url_to_fetch, done) {
  console.log("getting: " + url_to_fetch);
  request({ uri: url_to_fetch }, function(err, res, body) {
    if (err) {
      done(err, null);
    }
    else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
      // redirect! go to the new URL
      exports.get(res.headers.location, done);
    }
    else {
      console.log(body);
      console.log("gotten", body);
      done(null, body);
    }
  });
};

