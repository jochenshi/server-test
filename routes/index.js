var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/')
var mongoClient = require('mongodb').MongoClient
var DB_CONNECT_STR = 'mongodb://localhost:27017/testdb'

// mongoClient.connect(DB_CONNECT_STR, function (err, db) {
//   if (err) {
//     console.log('连接失败', err)
//   } else {
//     console.log('连接成功')
//   }
// })

var db = mongoose.connection

var establishConnect = function (fun, req, res) {
  mongoClient.connect(DB_CONNECT_STR, function(err, db) {
    if (err) {
      console.log('连接失败', err)
    } else {
      console.log('连接成功')
      fun.call(null, db, req, res)
    }
  })
}

var getData = function (db, req, res) {
  var collection = db.collection('aaa')
  collection.find().toArray(function (err, result) {
    if (err) {
      console.log('Error:' + err)
      return
    } else {
      console.log('aa', result)
      res.send(result)
    }
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  mongoClient.connect(DB_CONNECT_STR, function(err, db) {
    var collects = db.collection('aaa')
    collects.find().toArray(function (err, result) {
      if (err) {
        console.log('error',err)
      } else {
        //console.log(result)
      }
    })
  })
  res.render('index', { title: 'Express' });
});
router.get('/v1/user',function(req, res){
  establishConnect(getData, req, res)
  // mongoClient.connect(DB_CONNECT_STR, function(err, db) {
  //   var collects = db.collection('aaa')
  //   collects.find().toArray(function (err, result) {
  //     if (err) {
  //       console.log('error',err)
  //     } else {
  //       console.log(result)
  //       res.send(result)
  //     }
  //   })
  // })
  //console.log(req)
  //res.send({'message':'Hello user', 'user_id':'1', 'username':'testuser1'})
});

router.get('/v1/users/:userId/book/:bookId', function(req, res){
  console.log(req.params)
})

router.get('/v1/users/:bookId-:name', function(req, res){
  console.log(req.params)
})

router.get('/v1/products', function (req, res) {

})


module.exports = router;


