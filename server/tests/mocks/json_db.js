/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var DBMock = module.exports = function() {
  this.data = {};
};
DBMock.prototype.get = function(search_options, done) {
  done && done(null, this.data[search_options.key]);
};
DBMock.prototype.save = function(config, done) {
  this.data[config.key] = config.data;
  done && done(null, true);
};


