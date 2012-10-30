const path        = require('path'),
      _           = require('underscore'),
      prod_config = require('./production').get();

exports.get = function() {
  return _.extend({}, prod_config, {
    json_db_path: path.join(__dirname, "..", "var", "pages.json"),
    public_url: "http://127.0.0.1:3000"
  });
};

