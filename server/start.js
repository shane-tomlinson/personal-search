
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express     = require('express'),
      path        = require('path'),
      pages       = require('./lib/pages'),
      indexer     = require('./lib/indexer');


pages.init(function(err) {
  if (err) throw err;

  var app = express();

  app.set('view engine', 'jade');
  app.set('views', path.join(__dirname, "views"));

  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, "..", "client")));

  app.get('/', function(req, res, next) {
    res.render('index', {
      search_text: null,
      url: null
    });
  });

  app.get('/search', function(req, res, next) {
    var search_text = req.query.search_text;
    pages.search({
      terms: search_text
    }, function(err, results) {

      res.render('index', {
        search_text: search_text,
        url: null,
        results: results
      });

    });
  });

  app.post('/save', function(req, res, next) {
    var page_url = req.body.url;

    res.render('index', {
      search_text: null,
      url: page_url
    });

    // let this go out of band
    indexer.index(page_url);
  });

  app.listen(process.env['PORT'] || 3000, process.env['IP_ADDRESS'] || '127.0.0.1');
});
