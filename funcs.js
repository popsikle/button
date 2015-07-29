var config = require('./config.js').getConfig(process.env.NODE_ENV);

if (config.test_mode === false) {
  var redis = require('redis')
} else {
  console.log("Running in TEST MODE")
  var redis = require('mock-redis-client').createMockRedis();
}

var rdb = redis.createClient(config.redis.port, config.redis.host)


/**
 * data Functions
 */

exports.getUser = function(email, cb) {
  key = 'user:' + email;
  rdb.hgetall(key, function(err, user) {
    cb(null, user);
  });
};

exports.addUser = function(email, data, cb) {
  key = 'user:' + email;
  user = {
    firstName: data.firstName,
    lastName: data.lastName
  }
  key = 'user:' + email
  rdb.hgetall(key, function(err, user) {
    if (err) cb(err, null)
    if (user) cb('User Exists', null)
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
    "status" : 0
  };
  res.status(200).send(ret_data)
  res.end();
};

exports.param_error = function(res, error) {
  console.log("Returning Error");
  if (res.headersSent === false) {
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

