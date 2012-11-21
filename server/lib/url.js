/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url       = require('url');

exports.toURL = function(possibleURL) {
  var parsedURL;

  // URLs cannot have spaces and must have at least one period.
  if (possibleURL.indexOf(" ") === -1 && possibleURL.indexOf(".") > -1) {
    if(!/http(s)?:\/\//.test(possibleURL)) {
      possibleURL = "http://" + possibleURL;
    }
    parsedURL = url.parse(possibleURL);
  }

  return parsedURL;
}

