/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const vows            = require('vows'),
      assert          = require('assert'),
      path            = require('path'),
      fs              = require('fs'),
      web_crawler     = require('../lib/crawlers/web-crawler');

var suite = vows.describe("web_crawler");
suite.export(module);

var rootDomain = "http://somedomain.com";

function getAnchorTestHTML() {
  var htmlPath = path.join(__dirname, '/test-content/anchors.html');
  var html = fs.readFileSync(htmlPath, 'utf8');
  return html;
}

function linkFound(links, link_to_find) {
  return links.indexOf(rootDomain + '/' + link_to_find) > -1
}

function testLinks(links) {
  assert.equal(links.length, 9);
  assert.ok(linkFound(links, "relative_with_hash.html"));
  assert.ok(linkFound(links, "relative.html"));
  assert.ok(linkFound(links, "with_path/relative.html"));
  assert.ok(linkFound(links, "absolute.html"));
  assert.ok(linkFound(links, "with_path/absolute.html"));
  assert.ok(linkFound(links, "full_url.html"));
  assert.ok(linkFound(links, "path/full_url_with_path.html"));
  assert.ok(linkFound(links, "protocol_relative.html"));
  assert.ok(links.indexOf("http://alternate.com/protocol_relative.html") > -1);
}

suite.addBatch({
  'anchors are handled correctly with trailing / on root URL': {
    topic: function() {
      var html = getAnchorTestHTML();
      web_crawler.getInfo(rootDomain + '/', html, this.callback);
    },

    'anchors are available': function(err, info) {
      assert.equal(err, null);

      testLinks(info.links);
    }
  }
});

suite.addBatch({
  'anchors are handled correctly without trailing / on root URL': {
    topic: function() {
      var html = getAnchorTestHTML();
      web_crawler.getInfo(rootDomain, html, this.callback);
    },

    'anchors are available': function(err, info) {
      assert.equal(err, null);

      testLinks(info.links);
    }
  }
});


