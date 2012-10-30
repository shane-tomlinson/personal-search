
const path        = require('path'),
      fs          = require('fs'),
      _           = require('underscore'),
      prod_config = require('./production').get();

exports.get = function() {
  var aws_config  = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "..", "config.json"), 'utf8'));

  return _.extend({}, prod_config, aws_config, {
    json_db_path: path.join(__dirname, "..", "..", "..", "var", "pages.json")
  });
};


