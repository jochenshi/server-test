var mysql = require('mysql')
var $conf = require('../config/db.js')
var $sql = require('./sql.js')
var actions = require('./actions.js')
var pool = mysql.createPool($conf.mysql)

var excuteFun = {
    //执行注册用户时验证账号，昵称是否被占用，通过则写入数据库
    register: function (req, res, next) {
       pool.getConnection(function(err, connection) {
           if (err) {
               throw err
           } else {
               var param = req.body
               connection.query($sql.check_register, [param.account, param.nickname], function (err, result) {
                   if (err) {
                       throw err
                   }
                   console.log(result)
                   if (result.length > 1) {
                       res.status(400).send(actions.formatResponse(400, '该昵称，账号已被占用'), result, false)
                   } else if (result.length === 1) {
                       if (param.account === result[0].account && param.nickname === result[0].nickname) {
                           res.send(actions.formatResponse(400, '该账号，账号已被占用', result, false))
                       } else if (param.account === result[0].account) {
                           res.send(actions.formatResponse(400, '该账号已被占用', result, false))
                       } else {
                           res.send(actions.formatResponse(400, '该昵称已被占用', result, false))
                       }
                   } else {
                       excuteFun.insertRegister(req, res, connection)
                   }
               })
           }
       })
    },
    // 注册用户时，将相关信息写入数据库
    insertRegister: function (req, res, connection) {
        var userId = 'user_' + Date.now()
        var param = req.body
        connection.query(
            $sql.insert_register, 
            {account: param.account, nickname: param.nickname, userId: userId, password: param.password},
            function (err, result) {
            if (err) {
                throw err
            } else {
                res.send(actions.formatResponse(200, '注册成功', result, true))
            }
        })
    },
    // 验证以及处理登录操作
    login: function (req, res, next) {
        var param = req.body
        pool.getConnection($sql.check_login, [param.account], function (err, result) {
            if (err) {
                throw err
            }
            if (!result) {
                res.status(400).send(actions.formatResponse(400, '该账号不存在', result, false))
            } else {
                if (result[0].password !== param.password) {
                    res.status(400).send(actions.formatResponse(400, '密码错误'))
                } else {
                    var id = Buffer.from(Date.now() + param.account).toString('hex')
                    var temp = actions.generateToken(param.account, id)
                    // 登录验证成功，将生成的cookie进行返回，该信息进行过加密
                    // 同时将生成的token存储进入数据库，并记录执行登录请求的时间
                    res.cookie(
                        'authInfo',
                        temp,
                        {expires: new Date(Date.now() + 30 * 60 * 1000), httpOnly: true}
                    ).send(actions.formatResponse(200, '登录成功', [temp], true))
                }
            }
        })
    },
    // 存储用户的token相关信息
    recordToken: function (userId, token, connection) {
        var time = Date.now()
        connection.query($sql.get_token, [userId], function (err, result) {
            if (err) {
                throw err
            }
            if (result) {
            } else {

            }
        })
        connection.query($sql.insert_token, {userId: userId, token: token, last_update: time}, function (err, result) {
            if (err) {
                throw err
            }
        })
    }
}
module.exports = excuteFun