
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express         = require('express'),
      path            = require('path'),
      persona         = require('express-persona');
      config          = require('./etc/config'),
      pages           = require('./lib/db/pages-elastic'),
      groups          = require('./lib/groups'),
      indexer         = require('./lib/indexer');


function renderPage(req, res, page, options, statusCode) {
  options.email = req.session.email;
  res.render(page, options);
}

pages.init({}, function(err) {
  indexer.init({ pages: pages }, function(err) {
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
          user: {
            email: req.session.email
          },
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

      app.get('/groups', function(req, res, next) {
        groups.search({
          user: { email: req.session.email }
        }, function(err, groups) {
          if (err) {
            res.send(500, String(err));
          }
          else {
            renderPage(req, res, 'groups', {
              group_name: null,
              groups: groups
            });
          }
        });
      });

      app.post('/groups', function(req, res, next) {
        if (req.session.email) {
          var email = req.session.email;
          var groups_to_add = req.body.groups;
          groups.update_user_groups({
            email: email,
            groups: groups_to_add
          }, function(err, status) {
            res.redirect(301, '/groups');
          });
        }
        else {
          res.send(401);
        }
      });

      app.post('/groups/new', function(req, res, next) {
        if (req.session.email) {
          var group_name = req.body.group;
          groups.save({ name: group_name }, function(err, status) {
            groups.search({
              user: {
                email: req.session.email
              }
            }, function(err, groups) {
              renderPage(req, res, 'groups', {
                group_name: group_name,
                groups: groups
              });
            });
          });
        }
        else {
          res.send(401);
        }
      });


      app.listen(process.env['PORT'] || 3000, process.env['IP_ADDRESS'] || '127.0.0.1');
  });
});
