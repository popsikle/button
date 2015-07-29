var config = require('./config.js').getConfig(process.env.NODE_ENV);

if (config.test_mode === false) {
  var redis = require('redis')
  var rdb = redis.createClient(config.redis.port, config.redis.host);
  console.log("Redis Connected " + config.redis.host + ":" + config.redis.port);
  if (config.redis.auth) {
    rdb.auth(config.redis.auth);
    console.log("Redis Authenticated " + config.redis.auth);
  }
} else {
  console.log("Running in TEST MODE")
  var redis = require('mock-redis-client').createMockRedis();
  var rdb = redis.createClient();
}

/**
 * data Functions
 */

exports.getUser = function(email, cb) {
  key = 'user:' + email;
  rdb.hgetall(key, function(err, user) {
    cb(null, user);
  });
};

exports.addUser = function(email, user, cb) {
  key = 'user:' + email;
  rdb.hgetall(key, function(err, userFound) {
    if (err) cb(err, null)
    if (userFound) cb('User Exists', null)
    rdb.hmset(key, user, function(err, reply) {
      if (err) cb(err, null)
      cb(null, user);
    });
  });
};

exports.addTransfer = function(email, points, cb) {
  key = 'transfers:' + email;
  skey = 'points:' + email;
  rdb.rpush(key, points, function (err, response) {
    if (err) cb(err, null)
    exports.getPoints(email, function(err, userPoints) {
      if (err) throw new Error(err);
      cb(null, userPoints);
    });
  });
};

exports.getTransfers = function(email, cb) {
  key = 'transfers:' + email;
  skey = 'points:' + email;
  rdb.lrange(key, 0, -1, function (err, items) {
    if (err) cb(err, null)
    var sum = 0
    if (items.length > 0) {
      items.forEach(function (item) {
        sum = sum + parseInt(item);
      });
    }
    rdb.set(skey, sum, function (err, response) {
      cb(null, items);
    });
  });
};

exports.getPoints = function(email, cb) {
  exports.getTransfers(email, function (err, items) {
    if (err) cb(err, null)
    rdb.get(skey, function (err, value) {
      cb(err, parseInt(value));
    });
  });
};

/**
 * Response Functions
 */
exports.returnResults = function(res, data) {
  console.log("Returning Results");
  ret_data = {
    "errors" : [],
    "ok" : true,
    "results" : data,
    "status" : 200
  };
  res.set('Content-Type', 'application/json');
  res.status(200).send(ret_data)
  res.end();
};

exports.param_error = function(res, error) {
  console.log("Returning Error");
  if (res.headersSent === false) {
    res.set('Content-Type', 'application/json');
    var ret_data = {
      "errors" : [
        error
      ],
      "ok" : false,
      "status" : 400
    };
    res.status(400).send(ret_data)
    res.end();
  } else {
    res.end();
  }
};

exports.param_missing = function(res, errors) {
  console.log("Returning Error");
  if (res.headersSent === false) {
    res.set('Content-Type', 'application/json');
    var ret_data = {
      "errors" : errors,
      "ok" : false,
      "status" : 400
    };
    res.status(400).send(ret_data)
    res.end();
  } else {
    res.end();
  }
};

