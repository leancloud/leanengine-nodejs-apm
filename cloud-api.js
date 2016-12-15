var _ = require('underscore');
var debug = require('debug')('leanengine:apm');

module.exports = function(options) {
  var aggregator = require('./aggregator').interval('cloudApi', 60000, _.extend({
    average: ['responseTime']
  }, options));

  var request;

  try { // cnpm, npm<=2
    request = require('leanengine/node_modules/leancloud-storage/dist/node/request');
  } catch (err) {
    debug(err);

    try { // npm>=3
      request = require('leancloud-storage/dist/node/request');
    } catch (err) {
      return console.error('[APM] Hack leancloud-storage failed', err);
    }
  }

  request.request = _.wrap(request.request, function(original, route, className, objectId, method) {
    var startedAt = new Date();
    var promise = original.apply(request, Array.prototype.slice.call(arguments, 1));

    promise.then(function(body, statusCode) {
      aggregator.put({
        count: 1,
        responseTime: Date.now() - startedAt.getTime(),
        url: generateUrl(route, className, objectId, method),
        statusCode: statusCode,
        method: method
      });
    }, function(err) {
      aggregator.put({
        count: 1,
        responseTime: Date.now() - startedAt.getTime(),
        url: generateUrl(route, className, objectId, method),
        statusCode: err.statusCode,
        method: method
      });
    });

    return promise;
  });
};

function generateUrl(route, className, objectId, method) {
  var url = method + ' ' + route;

  if (className)
    url += '/' + className;

  if (objectId)
    url += '/:id';

  return url;
}
