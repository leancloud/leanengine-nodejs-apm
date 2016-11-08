var onHeaders = require('on-headers');
var onFinished = require('on-finished');
var pathToRegexp = require('path-to-regexp');
var debug = require('debug')('leanengine:apm');
var request = require('request');
var _ = require('underscore');

module.exports = function(options) {
  var aggregator = require('./aggregator').interval('request', 60000, _.extend({
    average: ['responseTime']
  }, options));

  var rewriteRules = [{
    match: /^GET .*\.(css|js|jpe?g|gif|png|woff2?|ico)$/,
    rewrite: 'GET *.$1'
  }, {
    match: /^(.*)[a-f0-9]{24}(.*)$/,
    rewrite: '$1:objectId$2'
  }];

  return function leanengineApm(req, res, next) {
    req._lc_startedAt = new Date();

    onHeaders(res, function() {
      res._lc_startedAt = new Date();
    });

    onFinished(res, function(err) {
      if (err)
        return console.error(err);

      var requestUrl = req.originalUrl.replace(/\?.*/, '');
      var responseTime = (res._lc_startedAt ? res._lc_startedAt.getTime() : Date.now()) - req._lc_startedAt.getTime();

      if (req.route) {
        // 如果这个请求属于一个路由，则用路由路径替换掉 URL 中匹配的部分
        var regexp = pathToRegexp(req.route.path).toString().replace(/^\/\^/, '').replace(/\/i$/, '');
        var matched = requestUrl.match(new RegExp(regexp, 'i'));

        if (matched[0]) {
          requestUrl = requestUrl.slice(0, matched.index) + req.route.path;
        }
      }

      requestUrl = req.method.toUpperCase() + ' ' + requestUrl;

      if (rewriteRules.some(function(rule) {
        if (requestUrl.match(rule.match)) {
          if (rule.ignore)
            return true;

          requestUrl = requestUrl.replace(rule.match, rule.rewrite);
        }
      })) {
        return debug('router: ignored %s', requestUrl);
      }

      debug('router: %s %s %sms', requestUrl, res.statusCode, responseTime);

      aggregator.put({
        count: 1,
        responseTime: responseTime,
        url: requestUrl,
        method: req.method,
        statusCode: res.statusCode
      });
    });

    next();
  };
};
