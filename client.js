var request = require('request');
var debug = require('debug')('leanengine:apm');

exports.token = null;

exports.sendMetrics = function(data) {
  if (exports.token === null) {
    console.error('[APM] was disabled because token is empty');
    exports.token = 'disabled';
    return;
  } else if (exports.token === 'disabled') {
    return;
  }

  debug('sendMetrics:request', data);

  request({
    url: (process.env.APM_URL_PREFIX || 'http://apm.leanapp.cn') + '/metrics',
    method: 'POST',
    json: data,
    headers: {
      Authorization: exports.token
    }
  }, function(err, res, body) {
    if (err) {
      console.error('[APM] sendMetrics', err);
    } else {
      debug('sendMetrics:response', res.statusCode, body);
    }
  });
};
