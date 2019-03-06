/*
*
*
*       Complete the API routing below
*
*
*/
'use strict';
const expect = require('chai').expect;
const MongoClient = require('mongodb');
const mongoose = require('mongoose');
const request = require('request');
const Schema = mongoose.Schema;
const likeSchema = new Schema({
  symbol: String,
  ip: String,
});
const Like = mongoose.model('Like', likeSchema);
mongoose.connect(process.env.DB);
module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async (req, res)=>{
    let symbol = req.query.stock;
    let wantstolike = req.query.like;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split(',')[0];
    if(Array.isArray(symbol)){
      var symbol_one = symbol[0].toUpperCase();
      var symbol_two = symbol[1].toUpperCase();
      var price_one = 0.0;
      var price_two = 0.0;
      var likes_one = 0;
      var likes_two = 0;
      request({
        uri: 'https://www.alphavantage.co/query',
        qs: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol_one,
          apikey: process.env.APIKEY,
        }
      },async (error, result, body)=>{
        let parsedBody = JSON.parse(body);
        price_one = parseFloat(parsedBody["Global Quote"]["05. price"]);
        await Like.find({symbol: symbol_one, ip: ip,}, (err, alreadyliked)=>{ 
          if(alreadyliked.length < 1 && wantstolike){
            Like.create({symbol: symbol_one, ip: ip,},(createerror, createlike)=>{
              if(createerror){return console.error(createerror)};
            })
          }
        })
        await Like.find({symbol: symbol_one}, (err, likeArray)=>{
          if(err){return console.error(err)};
          likes_one = likeArray.length;
        })
        request({
          uri: 'https://www.alphavantage.co/query',
          qs: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol_two,
            apikey: process.env.APIKEY,
          }
        },async (error, result, body)=>{
          let parsedBody = JSON.parse(body);
          price_two = parseFloat(parsedBody["Global Quote"]["05. price"]);
          await Like.find({symbol: symbol_two, ip: ip,}, (err, alreadyliked)=>{
            if(alreadyliked.length < 1 && wantstolike){
              Like.create({symbol: symbol_two, ip: ip,},(createerror, createlike)=>{
                if(createerror){return console.error(createerror)};
              })
            }
          })
          await Like.find({symbol: symbol_two}, (err, likeArray)=>{
            if(err){return console.error(err)};
            likes_two = likeArray.length;
          })
          return res.json({stockData:[{
            stock:symbol_one, price: price_one, rel_likes: likes_one - likes_two,
          },{
            stock:symbol_two, price: price_two, rel_likes: likes_two - likes_one    
          }]
                          });
        })
      })
    }else{
      symbol = symbol.toUpperCase();
      request({
        uri: 'https://www.alphavantage.co/query',
        qs: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: process.env.APIKEY,
        }
      },async (error, result, body)=>{
        let parsedBody = JSON.parse(body);
        let price = parseFloat(parsedBody["Global Quote"]["05. price"]);
        await Like.find({symbol: symbol, ip: ip,}, (err, alreadyliked)=>{
          if(alreadyliked.length < 1 && wantstolike){
            Like.create({symbol: symbol, ip: ip,},(createerror, createlike)=>{
              if(createerror){return console.error(createerror)};
            })
          }
        })
        Like.find({symbol: symbol}, (err, likeArray)=>{
          if(err){return console.error(err)};
          let likes = likeArray.length;
          res.json({stockData:{stock:symbol,price:price,likes:likes}})
        })
      })
    }
  })
  .delete((req, res)=>{
    let _id = req.body._id;
    Like.findByIdAndDelete(_id, (err, like)=>{
      if(err){return console.error(err)}
      res.send(`deleted like of ${like.symbol} with id ${like._id}`)
    })
  })
};
