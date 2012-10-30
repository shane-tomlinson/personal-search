#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs'),
      url = require('url');

var domains = {};

var pages = JSON.parse(fs.readFileSync('pages.json', 'utf8')).pages;

console.log("There are", Object.keys(pages).length, "pages");
for(var savedURL in pages) {
  var parsedSavedURL = url.parse(savedURL);

  domains[parsedSavedURL.hostname] = true;
}


console.log("there are", Object.keys(domains).length, "domains");

console.log(Object.keys(domains));


