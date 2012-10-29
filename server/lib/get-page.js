/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * get a web page
 */

const request = require('request');

exports.get = function(resource_url, etag, done) {
  var request_options = {
    uri: resource_url,
    followRedirect: true
  };

  if (etag) {
    request_options.headers = {
      "If-None-Match": etag
    };
  }

  request(request_options, function(err, res, body) {
    if (err) {
      done(err, null);
    }
    else {
      done(null, {
        statusCode: res.statusCode,
        body: body,
        ETag: res.headers.etag
      });
    }
  });
};

