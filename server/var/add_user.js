#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs'),
      url = require('url');

var domain = process.argv[2],
    email = process.argv[3];


if (!email) {
  email = domain;
  domain = "*";
}

console.log(domain, email);

if (!email) {
  console.log("email must be specified");
  process.exit(1);
}

var data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
var pages = data.pages;

console.log("There are", Object.keys(pages).length, "pages");
var count = 0;
for(var savedURL in pages) {
  var parsedSavedURL = url.parse(savedURL);

  if(domain === "*" || parsedSavedURL.hostname === domain) {
    var page = pages[savedURL];
    page.users = page.users || [];

    if (page.users.indexOf(email) === -1) {
      page.users.push(email);
      count++;
    }
  }
}

console.log("updated", count, "pages");

fs.writeFileSync('db.json', JSON.stringify(data), 'utf8');


