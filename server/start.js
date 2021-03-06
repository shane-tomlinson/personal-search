
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express         = require('express'),
      path            = require('path'),
      persona         = require('express-persona'),
      url             = require('url'),
      config          = require('./etc/config'),
      pages           = require('./lib/db/pages-json'),
      toURL           = require('./lib/url').toURL,
      groups          = require('./lib/groups'),
      indexer         = require('./lib/indexer');


function renderPage(req, res, page, options, statusCode) {
  options.email = req.session.email;
  res.render(page, options);
}

console.log("public_url", config.public_url);

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

      app.get('/start', function(req, res, next) {
        var search_text = req.query.val,
            possibleURL = search_text.replace(/"#.*$/, ''),
            parsedURL = toURL(possibleURL);

        var searchConfig = {
          user: {
            email: req.session.email
          },
          terms: search_text
        };

        pages.search(searchConfig, function(err, results) {
          var indexedURL;

          // This thing looked like a URL, the user is logged in, and there
          // are no results. See if we can index.
          console.log("url", parsedURL);
          if (parsedURL && parsedURL.host && req.session.email) {
            var searchURL = url.format(parsedURL);
            var searchConfig = {
              user: {
                email: req.session.email
              },
              url: searchURL
            };

            pages.search(searchConfig, function(err, urlResults) {
              if (urlResults.length === 0) {
                indexedURL = searchURL;
                indexer.index(indexedURL, req.session.email, false);
              }
              done();
            });
          }
          else {
            // this is not a URL, just show the results
            done();
          }

          function done() {
            // there are some results. Get 'em
            renderPage(req, res, 'index', {
              search_text: search_text,
              url: indexedURL,
              results: results
            });
          }
        });
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


