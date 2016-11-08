var os = require('os');
var _ = require('underscore');

var client = require('./client');

var aggregator = module.exports;

aggregator.interval = function interval(name, interval, options) {
  options = options || {};
  var sumFields = options.sum || [];
  var averageFields = options.average || [];
  var valueFields = sumFields.concat(averageFields);
  var buffer = {};

  setInterval(function() {
    if (!_.isEmpty(buffer)) {
      client.sendMetrics({
        metric: name,
        instance: process.env.LEANCLOUD_APP_INSTANCE || os.hostname(),
        points: _.map(buffer, function(values) {
          return _.mapObject(values, function(value, field) {
            if (_.contains(averageFields, field)) {
              return value / values.count;
            } else {
              return value;
            }
          });
        })
      });

      buffer = {};
    }
  }, interval);

  return {
    put: function(tags) {
      var uniqueName = _.without.apply(null, [_.keys(tags)].concat(valueFields)).sort().map(function(tag) {
        return tags[tag];
      }).join();

      if (buffer[uniqueName]) {
        buffer[uniqueName].count += 1;

        valueFields.forEach(function(field) {
          buffer[uniqueName][field] += tags[field];
        });
      } else {
        buffer[uniqueName] = tags;
        buffer[uniqueName].count = 1;
      }
    },

    buffer: function() {
      return buffer
    }
  };
};
