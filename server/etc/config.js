
var configs = {
  local: require('./local'),
  aws: require('./aws'),
  production: require('./production')
};

var env = process.env['NODE_ENV'] || 'local';
var getConfig = configs[env].get;

if (!getConfig) throw new Error("invalid NODE_ENV: " + env);

var config = getConfig();

console.log(" >> Starting up with config:", env);
console.log(" >>> config =", config);

module.exports = config;


