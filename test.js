var assert = require('assert');
var app = require('./app.js');

describe('Database', function () {
  describe('Round-Trip', function () {
    it('should be able to store a testvalue to DB', function () {
 
    const preparePromise = app.query('INSERT INTO content VALUES("testvalue")').then(function() {

    const valuePromise = app.query('SELECT content FROM content');
    return valuePromise.then(result => {
     	assert.equal(result.length, 1);
      	assert.equal(result[0].content, "testvalue");
    });

    });

    });


  });
});
