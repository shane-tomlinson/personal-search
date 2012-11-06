
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express         = require('express'),
      path            = require('path'),
      persona         = require('express-persona');
      config          = require('./etc/config'),
      json_db         = require('./lib/db/json'),
      pages           = require('./lib/pages'),
      groups          = require('./lib/groups'),
      indexer         = require('./lib/indexer');


function renderPage(req, res, page, options, statusCode) {
  options.email = req.session.email;
  console.log(options.email);
  res.render(page, options);
}

pages.init({ db: json_db }, function(err) {
  if (err) throw err;

  groups.init({ db: json_db }, function(err) {
    if (err) throw err;

    var app = express();

    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname, "views"));

    app.use(express.bodyParser())
       .use(express.cookieParser())
       .use(express.session({
         secret: 'mysecret'
       }))
       .use(express.static(path.join(__dirname, "..", "client")));

    persona(app, {
      audience: config.public_url
    });

    app.get('/', function(req, res, next) {
      renderPage(req, res, 'index', {
        search_text: null,
        url: null
      });
    });

    app.get('/search', function(req, res, next) {
      var search_text = req.query.search_text;
      pages.search({
        user: req.session.email,
        terms: search_text
      }, function(err, results) {
        renderPage(req, res, 'index', {
          search_text: search_text,
          url: null,
          results: results
        });
      });
    });

    app.post('/save', function(req, res, next) {
      if (req.session.email) {
        var page_url = req.body.url.replace(/"#.*$/, '');

        renderPage(req, res, 'index', {
          search_text: null,
          url: page_url
        });

        // let this go out of band
        indexer.index(page_url, req.session.email, false);
      }
      else {
        res.send(401);
      }
    });

    app.get('/group', function(req, res, next) {
      renderPage(req, res, 'group', {
        group_name: null,
        groups: []
      });
    });

    app.post('/group', function(req, res, next) {
      if (req.session.email) {
        var group_name = req.body.group;
        renderPage(req, res, 'group', {
          group_name: group_name,
          groups: []
        });
      }
      else {
        res.send(401);
      }
    });

    app.listen(process.env['PORT'] || 3000, process.env['IP_ADDRESS'] || '127.0.0.1');
  });
});
