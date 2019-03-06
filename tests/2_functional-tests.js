/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/
const chaiHttp = require('chai-http'); 
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);
const cleanup = (_id, done)=>{
  chai.request(server)
    .delete('/api/stock-prices')
    .send({_id: _id})
    .end((err, res)=>{
    if(err){return console.error(err)};
    assert.equal(res.status, 200);
    done();
  })
}
suite('Functional Tests', ()=>{
  suite('GET /api/stock-prices => stockData object', function() {
    test('1 stock', (done)=>{
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'amzn'})
        .end((err, res)=>{
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.isString(res.body.stockData.stock, 'check on stock name');
        assert.isNumber(res.body.stockData.price, 'check on stock price');
        assert.isNumber(res.body.stockData.likes);
        done()
      });
    });
    test('1 stock with like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'amzn', like: true})
        .end((err, res)=>{
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isAbove(res.body.stockData.likes, 0);
        done()
      });
    });
    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'amzn', like: true})
        .end((err, res)=>{
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.isString(res.body.stockData.stock);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        let likes = res.body.likes;
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'amzn', like: true})
          .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.isObject(res.body.stockData);
          assert.isString(res.body.stockData.stock);
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          assert.equal(res.body.likes, likes);
          done();
        });
      });
    });
    test('2 stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['amzn','csco']})
        .end((err, res)=>{
        assert.equal(res.status, 200);
        console.log(res.body.stockData);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.isObject(res.body.stockData[0]);
        assert.isString(res.body.stockData[0].stock);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isObject(res.body.stockData[1]);
        assert.isString(res.body.stockData[1].stock);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[1].rel_likes);
        assert.equal(Math.abs(res.body.stockData[1].rel_likes), Math.abs(res.body.stockData[0].rel_likes));
        done();
      });
    });
    test('2 stocks with like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['amzn','csco'], like:true})
        .end((err, res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.isObject(res.body.stockData[0]);
        assert.isString(res.body.stockData[0].stock);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isObject(res.body.stockData[1]);
        assert.isString(res.body.stockData[1].stock);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[1].rel_likes);
        assert.equal(Math.abs(res.body.stockData[1].rel_likes), Math.abs(res.body.stockData[0].rel_likes));
        done();
      });
    });
  });
});
