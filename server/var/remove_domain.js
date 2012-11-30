#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs'),
      url = require('url'),
      dbFile = require('./config').dbFile;

var domainToRemove = process.argv[2];
console.log(domainToRemove);

if (!domainToRemove) {
  console.log("domain to remove must be specified");
  process.exit(1);
}

var data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
var pages = data.pages;

console.log("There are", Object.keys(pages).length, "pages");
var count = 0;
for(var savedURL in pages) {
  var parsedSavedURL = url.parse(savedURL);

  if(parsedSavedURL.hostname === domainToRemove) {
    console.log("Removing", savedURL);
    delete pages[savedURL];
    count++;
  }
}

console.log("removed", count, "pages");

fs.writeFileSync(dbFile, JSON.stringify(data), 'utf8');


