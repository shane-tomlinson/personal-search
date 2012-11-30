/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// take care of crawling a GitHub repo's readmes.


const github            = require('github'),
      post_process      = require('./post-process');

exports.get = function(user, repo, done) {
  var start = new Date();

  var client = new github({
    version: "3.0.0"
  });

  var repoConfig = {
    user: user,
    repo: repo
  };

  client.repos.get(repoConfig, function(err, repoRes) {
    if (err) return (done && done(err));

    client.repos.getReadme(repoConfig, function(err, res) {
      processReadme(err, res, function(err, readme) {
        if (err) return (done && done(err));

        readme.url = repoRes.html_url;
        readme.title = repoRes.full_name + ': ' + repoRes.description;
        done && done(null, readme);
      });
    });
  });

  function processReadme(err, res, done) {
    if (err) {
      return (done && done(err));
    }

    var content = new Buffer(res.content, 'base64').toString();
    var textInfo = post_process.process(content);

    done(null, {
      processing_time: new Date() - start,
      text: textInfo.text_no_punctuation,
      words: textInfo.words,
      summary: textInfo.text_clean.substr(0, 1000),
      links: []
    });
  }
};

