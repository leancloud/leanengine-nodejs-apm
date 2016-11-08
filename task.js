var _ = require('underscore');

module.exports = function(options) {
  var aggregator = require('./aggregator').interval('task', 60000, _.extend({
    average: ['duration']
  }, options));

  var createTracker = function createTracker(name, started) {
    started = started || new Date();

    return {
      end: function(tags) {
        aggregator.put(_.extend({
          name: name,
          count: 1,
          duration: Date.now() - started.getTime()
        }, tags))
      }
    }
  };

  var wrapTask = function wrapTask(name, tags, func) {
    if (!func) {
      func = options;
      tags = {};
    }

    return function wrappedFunction() {
      var tracker = createTracker(name);

      return Promise.resolve().then(func).then(function(result) {
        tracker.end(_.extend({error: false}, tags));
        return result;
      }, function(err) {
        tracker.end(_.extend({error: true}, tags));
        throw err;
      });
    }
  };

  return {
    createTracker: createTracker,
    wrapTask: wrapTask
  };
};
