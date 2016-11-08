var chai = require('chai');

chai.Should();

describe('aggregator', function() {
  it('put', function() {
    var aggregator = require('../aggregator').interval('request', 60000, {
      average: ['responseTime']
    });

    aggregator.put({
      url: 'GET /',
      method: 'GET',
      statusCode: 200,
      responseTime: 10
    });

    aggregator.put({
      url: 'GET /',
      method: 'GET',
      statusCode: 200,
      responseTime: 20
    });

    aggregator.put({
      url: 'POST /files',
      method: 'POST',
      statusCode: 401,
      responseTime: 20
    });

    var buffer = aggregator.buffer();

    buffer['GET,200,GET /'].should.be.eql({
      url: 'GET /',
      method: 'GET',
      statusCode: 200,
      responseTime: 30,
      count: 2
    });

    buffer['POST,401,POST /files'].should.be.eql({
      url: 'POST /files',
      method: 'POST',
      statusCode: 401,
      responseTime: 20,
      count: 1
    });
  });
});
