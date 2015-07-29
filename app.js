/**
 * Node JS Button App
 *
 * Salvatore Poliandro III <popsikle@gmail.com>
 * Date: 7/28/15
 */

/**
 * Configuration
 */

/**
 * App Setup / Imports
 */
var express = require('express');
var expressValidator = require('express-validator');
var http = require('http');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var config = require('./config.js').getConfig(process.env.NODE_ENV);
var funcs = require("./funcs.js");

var app = express();
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

if (config.use_proxy === true) {
  app.enable('trust proxy');
}

/**
 * Application routes
 */
app.route('/user/create')
  .post(function(req, res) {
    req.assert('email', 'email field invalid').isEmail();
    req.assert('firstName', 'firstName field invalid').len(2, 30);
    req.assert('lastName', 'lastName field invalid').len(2, 30);

    var errors = req.validationErrors();
    if (errors.length > 0) {
      funcs.param_missing(res,errors);
      return false;
    }

    var email = req.body.email
    funcs.getUser(email, function(err, user) {
      if (err) throw new Error(err);
      if (user) {
        funcs.param_error(res, "User Exists")
      } else {
        funcs.addUser(email, {
          firstName: req.body.firstName,
          lastName: req.body.lastName
        }, function(err, user) {
          if (err) throw new Error(err);
          funcs.returnResults(res, user);
        });
      }
    });
  });


app.route('/user/points')
  .get(function(req, res) {
    req.assert('email', 'email field invalid').isEmail();

    var errors = req.validationErrors();
    if (errors.length > 0) {
      funcs.param_missing(res,errors);
      return false;
    }

    var email = req.query.email;
    funcs.getUser(email, function(err, user) {
      if (err) throw new Error(err);
      if (user) {
        funcs.getPoints(email, function(err, points) {
          if (err) throw new Error(err);
          funcs.returnResults(res, points);
        });
      } else {
        funcs.param_error(res, "User Not Found")
      }
    });

  });


app.route('/transfer/record')
  .post(function(req, res) {
    req.assert('email', 'email field invalid').isEmail();
    req.assert('points', 'points not an integer').isInt();

    var errors = req.validationErrors();
    if (errors.length > 0) {
      funcs.param_missing(res,errors);
      return false;
    }

    var email = req.body.email;
    var points = parseInt(req.body.points);
    funcs.getUser(email, function(err, user) {
      if (err) throw new Error(err);
      if (user) {
        funcs.getPoints(email, function(err, userPoints) {
          if (err) throw new Error(err);
          if (userPoints + points > 0) {
            funcs.addTransfer(email, points, function(err, userPoints){
              if (err) throw new Error(err);
              funcs.returnResults(res, userPoints);
            });
          } else {
            funcs.param_error(res, "User Point balance can not go negative")
          }
        });
      } else {
        funcs.param_error(res, "User Not Found")
      }
    });
  });


app.route('/transfer/list')
  .get(function(req, res) {
    req.assert('email', 'email field invalid').isEmail();
    var errors = req.validationErrors();
    if (errors.length > 0) {
      funcs.param_missing(res,errors);
    }

    var email = req.query.email;
    funcs.getUser(email, function(err, user) {
      if (err) throw new Error(err);
      if (user) {
        funcs.getTransfers(email, function(err, items) {
          if (err) throw new Error(err);
          funcs.returnResults(res, items);
        });
      } else {
        funcs.param_error(res, "User Not Found")
      }
    });
  });


/**
 * Error Functions, lets not bubble up k?
 */
app.use(function errorHandler(err, req, res, next) {
  console.error(err.stack);
  if (res.headersSent === false) {
    res.status(500).send({ error: 'This is not the page you are looking for!' })
    res.end();
  }
  next(err);
});


/**
 * Start the application server
 */
if (config.test_mode === false) {
  console.log("Startings server on " + config.host + ":" + config.port);
  http.createServer(app).listen(config.port, config.host);
}
