/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const jsdom      = require('jsdom');


function removeElements(window, type) {
  var els = window.document.getElementsByTagName(type);
  var count = els && els.length;
  for (var element, index=0; index < count; index++) {
    element = els[index];
    element.parentNode.removeChild(element);
  }
}

function getAnchors(window) {
  var els = window.document.getElementsByTagName("a");
  var count = els && els.length;
  var anchors = {};
  for (var element, index=0; index < count; index++) {
    element = els[index];
    // get rid of any hashes
    var href = element.href.replace(/#.*/g, '');
    anchors[href] = true;
  }

  return Object.keys(anchors);;
}

function getWords(text) {
  var words = {};
  var wordArray = text.split(' ');
  wordArray.forEach(function(word) {
    words[word.toLowerCase()] = true;
  });

  return Object.keys(words);
}

exports.get = function(url, done) {
  jsdom.env(url, [], function(err, window) {
    if (err) {
      done(err, null);
      return;
    }

    var start = new Date();

    // get rid of scripts, links and iframes
    removeElements(window, "script");
    removeElements(window, "link");
    removeElements(window, "iframe");

    // strip all tags, replace tags with a space.
    // strip all multiple whitespace occurrances with a single space
    var text = window.document.body.innerHTML.replace(/<(.*?)>/g, ' ')
        // the next two are because after replacing tags with spaces, sometimes
        // there are spaces and then punctuation marks
        .replace(' .', '.')
        .replace(' ,', ',')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace('&nbsp', ' ')
        .replace(/\s+/g, ' ').trim();

    console.log(text);

    var textWithoutPunctuation = text.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    var links = getAnchors(window);
    var words = getWords(textWithoutPunctuation);

    done(null, {
      processing_time: new Date() - start,
      words: words,
      summary: text.substr(0, 1000),
      title: window.document.title,
      url: url,
      links: links
    });
  });
};

