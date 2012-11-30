/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

exports.process = function(full_text) {
  // strip all tags, replace tags with a space.
  // strip all multiple whitespace occurrances with a single space
  var text = full_text.replace(/<(.*?)>/g, ' ')
      // the next two are because after replacing tags with spaces, sometimes
      // there are spaces and then punctuation marks
      .replace(' .', '.')
      .replace(' ,', ',')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace('&nbsp', ' ')
      .replace(/\s+/g, ' ').trim();

  var textWithoutPunctuation = text.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
  var words = getWords(textWithoutPunctuation);

  return {
    text_full: full_text,
    text_clean: text,
    text_no_punctuation: textWithoutPunctuation,
    words: words
  };
};

function getWords(text) {
  var words = {};
  var wordArray = text.split(' ');
  wordArray.forEach(function(word) {
    words[word.toLowerCase()] = true;
  });

  return Object.keys(words);
}

