var _ = require('underscore');

var aggregator = require('./aggregator').interval('task', 60000, _.extend({
  average: ['duration']
}));

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

var runTask = function runTask() {
  return wrapTask.apply(this, arguments)();
};

var wrapTask = function wrapTask(name, tags, func) {
  if (!func) {
    func = tags;
    tags = {};
  }

  return function wrappedFunction() {
    var tracker = createTracker(name);

    return Promise.resolve().then( () => {
      return func.apply(this, arguments);
    }).then(function(result) {
      tracker.end(_.extend({error: 'false'}, tags));
      return result;
    }, function(err) {
      tracker.end(_.extend({error: 'true'}, tags));
      throw err;
    });
  }
};

var wrapCallbackTask = function wrapCallbackTask(name, tags, func) {
  if (!func) {
    func = tags;
    tags = {};
  }

  return function wrappedFunction() {
    var tracker = createTracker(name);

    var args = Array.prototype.slice.call(arguments);
    var callback;

    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();

    }

    args.push(function(err) {
      if (err) {
        tracker.end(_.extend({error: 'false'}, tags));
      } else {
        tracker.end(_.extend({error: 'true'}, tags));
      }

      callback.apply(this, arguments);
    });

    try {
      func.apply(this, args)
    } catch (err) {
      tracker.end(_.extend({error: 'true'}, tags));
      throw err;
    }
  };
};

module.exports = {
  runTask,
  createTracker,
  wrapTask,
  wrapCallbackTask
};
