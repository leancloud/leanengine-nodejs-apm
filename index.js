var cloudApi = require('./cloud-api');
var express = require('./express');
var client = require('./client');
var task = require('./task');

module.exports = {
  init: function(token) {
    client.token = token;
  },

  express: express,
  cloudApi: cloudApi,
  runTask: task.runTask,
  createTracker: task.createTracker,
  wrapTask: task.wrapTask,
  wrapCallbackTask: task.wrapCallbackTask
};
