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

function testRootLinks(links) {
  assert.equal(links.length, 12);
  var linksToFind = [
    "relative_with_hash.html",
    "relative.html",
    "with_path/relative.html",
    "absolute.html",
    "with_path/absolute.html",
    "deep/deep/deep/path.html",
    "full_url.html",
    "path/full_url_with_path.html",
    "protocol_relative.html"
  ];
  linksToFind.forEach(function(link) {
    assert.ok(linkFound(links, link));
  });
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

      testRootLinks(info.links);
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

      testRootLinks(info.links);
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

      testRootLinks(info.links);
    }
  }
});

suite.addBatch({
  'anchors are handled correctly when starting at /path/': {
    topic: function() {
      var html = getAnchorTestHTML();
      web_crawler.getInfo(rootDomain + '/path/', html, this.callback);
    },

    'anchors are available': function(err, info) {
      assert.equal(err, null);

      var links = info.links;

      assert.equal(links.length, 12);
      var linksToFind = [
        "path/relative_with_hash.html",
        "path/relative.html",
        "path/with_path/relative.html",
        "absolute.html",
        "with_path/absolute.html",
        "with_path/",
        "page_without_extension",
        "deep/deep/deep/path.html",
        "full_url.html",
        "path/full_url_with_path.html",
        "protocol_relative.html"
      ];
      linksToFind.forEach(function(link) {
        assert.ok(linkFound(links, link), link + " is found");
      });
      assert.ok(links.indexOf("http://alternate.com/protocol_relative.html") > -1);
    }
  }
});



