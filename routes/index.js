var express = require('express');
var router = express.Router();
var mysql = require('mysql')
var srypto = require('crypto')
// var connection = mysql.createConnection({
//   host : 'localhost',
//   user : 'root',
//   password : 'unis123',
//   database : 'vue-end'
// })
// var actions = require('../common/actions')

// connection.connect()

// var a = actions.generateToken('admin','userId1')
var sqlHandle = require('../common/sqlHandle')




/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
//   console.log(req.cookies)
//   console.log(req.signedCookies)
// });

//过滤所有请求的方法，用于进行相关的验证
router.use(function (req, res, next) {
  sqlHandle.handleAll(req, res, next)
})

//过滤所有请求的方法，用于进行相关的验证
// router.use(function (req, res, next) {
//   console.log('go in filter method', req.path)
//   var getAuth = req.cookies.authInfo
//   if (req.path !== '/v1/login') {
//     if (!getAuth) {
//     res.status(404).send({mess:'您尚未登录，请先登录', code: 404})
//     } else {
//       var decrypt = actions.decrypted(getAuth).userId
//       if (!decrypt) {
//         result({mess:'登录信息无效，请重新登录', code: 404})
//         res.status(404).send(result)
//       } else {
//         // connection.query('SELECT * from `userSecret` WHERE userId =' + decrypt, function (error, results, fields) {
//         //   console.log(results)
//         // })
//         next()
//       }
//     }
//   } else {
//     next()
//   }
  
//   // res.cookie('authInfo', actions.encryptData('testcookievalue'), {expires: new Date(Date.now() + 15000) , httpOnly: true})
//   // next()
//   console.log(getAuth, '=================')
// })


// 处理登录请求的方法
router.post('/v1/login', function (req, res, next) {
  sqlHandle.login(req, res, next)
})


// get user info
router.get('/v1/user',function(req, res){
  console.log(req.session)
  // connection.query('SELECT * from `user_table`', function (error, results, fields) {
  //   if (error) {
  //     throw error
  //   } else {
  //     res.send({result: true, data: results})
  //   }
  // })
  console.log(actions.decodeToken(req.cookie.authInfo))
  res.send({'message':'Hello user', 'user_id':'1', 'username':'testuser1'})
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

// 处理注册用户的请求
router.post('/v1/register', function (req, res, next) {
  sqlHandle.register(req, res, next)
})

router.get('/v1/users/:userId/book/:bookId', function(req, res){
  console.log(req.params)
})

router.get('/v1/users/:bookId-:name', function(req, res){
  console.log(req.params)
})

router.get('/v1/products', function (req, res) {

})

// 获取用户信息的请求
router.get('/v1/personalInfo', function (req, res, next) {
  console.log(req.cookies)
  console.log(req.signedCookies)
  sqlHandle.getUserInfo(req, res, next)
})

// 更新用户信息的请求
router.post('/v1/personalInfo', function (req, res, next) {
  sqlHandle.updateUserInfo(req, res, next)
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


