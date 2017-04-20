var chai = require('chai');
var apm = require('..');

chai.Should();

var promiseFuncSuccess = apm.wrapTask('promiseFuncSuccess', function(arg1, arg2) {
  arg1.should.be.equal(1);
  arg2.should.be.equal(2);
  return 3;
});

var promiseFuncError = apm.wrapTask('promiseFuncError', function(arg1, arg2) {
  arg1.should.be.equal(1);
  arg2.should.be.equal(2);
  return Promise.reject(new Error('some error'));
});

var callbackFuncSuccess = apm.wrapCallbackTask('callbackFuncSuccess', function(arg1, arg2, callback) {
  arg1.should.be.equal(1);
  arg2.should.be.equal(2);
  callback(null, 3);
});

var callbackFuncError = apm.wrapCallbackTask('callbackFuncSuccess', function(arg1, arg2, callback) {
  arg1.should.be.equal(1);
  arg2.should.be.equal(2);
  callback(new Error('some error'));
});


describe('aggregator', function() {
  it('promiseFuncSuccess', () => {
    return promiseFuncSuccess(1, 2).then( result => {
      result.should.be.equal(3);
    });
  })

  it('promiseFuncError', () => {
    return promiseFuncError(1, 2).then( () => {
      console.error('should failed');
    }).catch( err => {
      err.message.should.be.equal('some error');
    });
  })

  it('callbackFuncSuccess', done => {
    callbackFuncSuccess(1, 2, (err, result) => {
      result.should.be.equal(3);
      done(err);
    });
  });

  it('callbackFuncError', done => {
    callbackFuncError(1, 2, (err) => {
      err.message.should.be.equal('some error');
      done();
    });
  });

  it('runTask', () => {
    return apm.runTask('someTask', {type: 'a'}, () => {
      return Promise.resolve();
    });
  });
});
