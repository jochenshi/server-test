var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'unis123',
  database : 'vue-end'
})
var actions = require('../common/actions')

connection.connect()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  console.log(req.cookies)
  console.log(req.signedCookies)
});


//过滤所有请求的方法，用于进行相关的验证
router.use(function (req, res, next) {
  console.log('go in filter method')
  var getAuth = req.cookies.authInfo
  if (!getAuth) {
    res.status(404).send({mess:'您尚未登录，请先登录', code: 404})
  } else {
    var decrypt = actions.decrypted(getAuth).userId
    if (!decrypt) {
      result({mess:'登录信息无效，请重新登录', code: 404})
      res.status(404).send(result)
    } else {
      connection.query('SELECT * from `userSecret` WHERE userId =' + decrypt, function (error, results, fields) {
        console.log(results)
      })
      next()
    }
  }
  console.log(getAuth, '=================')
})


// get user info
router.get('/v1/user',function(req, res){
  connection.query('SELECT * from `user_table`', function (error, results, fields) {
    if (error) {
      throw error
    } else {
      res.send({result: true, data: results})
    }
  })
  //res.send({'message':'Hello user', 'user_id':'1', 'username':'testuser1'})
});

router.get('/v1/activity', function (req, res) {
  connection.query('SELECT * from `activity_table`', function (error, results, fields) {
    if (error) {
      throw error
    } else {
      res.send({result: true, data: results})
    }
  })
})


router.post('/v1/user', function(req, res) {
  actions.validateUser(req.body)
  //console.log(req.body)
  res.send(req.body)
})

router.get('/v1/users/:userId/book/:bookId', function(req, res){
  console.log(req.params)
})

router.get('/v1/users/:bookId-:name', function(req, res){
  console.log(req.params)
})

router.get('/v1/products', function (req, res) {

})

router.get('/v1/personalInfo', function (req, res) {

  console.log(req.cookies)
  console.log(req.signedCookies)
  res.send({'id': '1', 'nickname': 'tom', 'sex': 'male', 'birth': 'Mon Jul 03 2017 13:40:26 GMT+0800 (中国标准时间)', 'height': 180, 'phone': 12222222222, 'mail': 'asd@qq.com', 'description': 'sadasdsadsadasdsadsad'})
})

router.post('/v1/personalInfo', function (req, res) {
  res.cookie('servertest', 'testcookievalue', {expires: new Date(Date.now() + 10000)})
  console.log(req.body)
  res.send({result: 'ok'})
})

router.post('/v1/sign', function (req, res) {
  res.status(404).send(new Error())
})

router.post('/v1/confirmApply', function (req, res) {
  console.log(req.body)
  res.send({success: true, mess: '申请成功'})
  //res.status(404).send({success: false, mess: '申请失败'})
})


module.exports = router;


