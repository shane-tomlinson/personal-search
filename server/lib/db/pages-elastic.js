/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const toolbelt      = require('../toolbelt'),
      sage          = require('sage'),
      _             = require('underscore'),
      db_index      = require('../../etc/config').elastic_db_index,
      db_type       = 'pages';

var db,
    type;

exports.init = function(config, done) {
  var client = sage('http://127.0.0.1:9200');
  db = client.index(db_index);
  type = db.type(db_type);

  exports.create(done);
};

exports.create = function(done) {
  db.exists(function(err, exists) {
    if (exists) {
      done && done(null);
    }
    else {
      db.create(function(err) {
        if (err) {
          done && done(err);
          return;
        }

        db.map('pages', {
          pages: {
            properties: {
              groups : {
                type : "string",
                index: "not_analyzed"
              },
              summary : {
                type : "string"
              },
              title : {
                type : "string"
              },
              url: {
                type: "string",
                index: "not_analyzed"
              },
              users: {
                type: "string",
                index: "not_analyzed"
              },
              text: {
                type: "string"
              },
              words: {
                type: "string"
              }
            }
          }
        }, done);
      });
    }
  });
};

exports.reset = function(done) {
  db.destroy(done);
};

exports.clear = function(done) {
  done && done(null);
};

exports.save = function(page, done) {
  type.post(page, function(err, body, status, headers, res) {
    done && done(err, page);
  });
};

exports.search = function(options, done) {
  var query = {
    bool: {
      should: []
    }
  };

  var should = query.bool.should;

  if (options.user && options.user.email) {
    should.push({ match: {
      users: options.user.email
    }});
  }

  if (options.user && options.user.groups) {
    should.push({ match: {
      groups: options.user.groups.join(' ')
    }});
  }

  if (options.terms) {
    should.push({ match: {
      words: options.terms
    }});
  }

  if (options.url) {
    should.push({ match: {
      url: options.url
    }});
  }

  if (Object.keys(query).length === 0) {
    query.match_all = {};
  }

  query = { query: query };
  console.log("search for:", JSON.stringify(query));
  db.find(query, function(err, results, res) {
    done && done(err, !err && _.pluck(results.hits, '_source'));
  });
};
