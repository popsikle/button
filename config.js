var _ = require('underscore');

var defaults = {
  test_mode: true,
  port: 52321,
  use_proxy: false,
  host: "0.0.0.0",
  redis: {
    host: "127.0.0.1",
    port: "6379",
    auth : null
  }
}


/**
 * Configuration based on env
 * @param {String} environment
 * @returns {Object} config
 */
exports.getConfig = function(env) {
  var config = _.extend({}, defaults);

  switch(env) {
    case 'ci':
      config = _.extend(config, {
        test_mode: false,
        port: 80,
        use_proxy: true,
        host: "127.0.0.1"
      });
      break;
    case 'staging':
      config = _.extend(config, {
        test_mode: false,
        port: 80,
        use_proxy: true,
        host: "127.0.0.1"
      });
      break;
    case 'production':
      config = _.extend(config, {
        test_mode: false,
        port: 80,
        use_proxy: true,
        host: "127.0.0.1"
      });
      break;
    case 'dev':
      config = _.extend(config, {
        port: 3333,
        test_mode: false
      });
      break;
    case 'heroku':
      var rtg = require("url").parse(process.env.REDIS_URL);
      config = _.extend(config, {
        port: 80,
        test_mode: false,
        redis: {
          host: rtg.hostname,
          port: rtg.port,
          auth: rtg.auth.split(":")[1]
        }
      });
      break;
    default:
      break;
  }
  return config;
}
