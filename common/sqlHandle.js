var mysql = require('mysql')
var $conf = require('../config/db.js')
var $sql = require('./sql.js')
var actions = require('./actions.js')
var $routes = require('../config/router.js')
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
                connection.query($sql.inset_userInfo, { nickname: param.nickname, uId: userId}, function (errs, results) {
                    if (errs) {
                        throw errs
                    } else {
                        res.send(actions.formatResponse(200, '注册成功', result, true))
                    }
                })
            }
        })
    },
    // 验证以及处理登录操作
    login: function (req, res, next) {
        var param = req.body
        pool.getConnection(function (err, connection) {
            if (err) {
                throw err
            }
            connection.query($sql.check_account, [param.account], function (error, result) {
                if (error) {
                    throw error
                }
                if (!result.length) {
                    res.status(400).send(actions.formatResponse(400, '该账号不存在', result, false))
                } else {
                    connection.query($sql.check_login, [param.account, param.password], function (errors, results) {
                        if (errors) {
                            throw errors
                        }
                        if (results.length) {
                            var userId = results[0].userId
                            var baseUser = Buffer.from(userId).toString('base64')
                            var configs = {expires: new Date(Date.now() + 30 * 60 * 1000), httpOnly: true}
                            var temp = actions.generateToken(param.account, baseUser)
                            // 登录验证成功，将生成的cookie进行返回，该信息进行过加密
                            // 同时将生成的token存储进入数据库，并记录执行登录请求的时间
                            excuteFun.recordToken(userId, temp, connection)
                            res.cookie('userId', baseUser, configs).cookie('authInfo', temp, configs).send(actions.formatResponse(400, '登录成功', ['asdasd'], true))
                        } else {
                            res.status(400).send(actions.formatResponse(400, '密码不正确', result, false))
                        }
                    })
                }
            })
        })
    },
    // 存储用户的token相关信息，此处需要通过userId来查询用户的相应的信息
    recordToken: function (userId, token, connection) {
        var time = Date.now()
        // 首先查询该用户是否已经存在token记录，不存在就插入数据，存在则进行更新
        connection.query($sql.get_token, [userId], function (err, result) {
            if (err) {
                throw err
            }
            if (result.length) {
                // 更新查到的token的相关信息，只有在执行登录操作的时候
                connection.query($sql.update_token, [token, time, userId], function (err, result) {
                    if (err) {
                        throw err
                    }
                })
            } else {
                // 未查询到数据的时候，将token插入数据库
                connection.query($sql.insert_token, {userId: userId, token: token, last_update: time}, function (err, result) {
                    if (err) {
                        throw err
                    }
                })
            }
        })
    },
    // 过滤所有请求的方法
    handleAll: function (req, res, next) {
        var path = req.path
        if ($routes.authRoutes.indexOf(path) > -1) {
            // 此处是需要进行auth验证的部分
            console.log('this path is in authroutes')
            var cookie = req.cookies
            if (!cookie.authInfo || !cookie.userId) {
                // 未携带cookie信息
                res.status(400).send(actions.formatResponse(400, '当前尚未登陆或者登录失效，请登陆', [], false))
            } else {
                var authInfo = cookie.authInfo, userId = cookie.userId
                var final = actions.decodeToken(authInfo) // 解析之后的authInfo
                var decodeId = Buffer.from(userId, 'base64').toString() // 解析之后的单独传过来的userId
                if (final) {
                    pool.getConnection(function (err, connection) {
                        if (err) throw err
                        excuteFun.getToken(connection, decodeId, authInfo, res, next)
                    })
                } else {
                    res.status(400).send(actions.formatResponse(400, '登录信息已经失效，请重新登陆'))
                }
            }
        } else {
            // 此处是不需要进行权限验证的部分，直接执行请求即可
            next()
        }
    },
    // 根据userId查询用户的相关token的信息
    getToken: function (connection, userId, token, res, next) {
        connection.query($sql.get_token, [userId], function (err, result) {
            if (err) {
                throw err
            }
            if (result.length) {
                var tmp = Date.now()
                // 判断token的间隔是否已经超过了30分钟
                var seperate = Math.abs(tmp - result[0].last_update) > 1800000
                // 因为存储在数据库是atob的格式，此处需要对base64进行解码，暂时的处理方式，等待对数据库的结构进行调整
                //var tempAuth = Buffer.from(result[0].token, 'base64').toString()
                var tempAuth = result[0].token
                var tokenFlag = token === tempAuth
                if (seperate || !tokenFlag) {
                    res.status(400).send(actions.formatResponse(400, '登录信息无效，请重新登陆', result, false))
                } else {
                    // 相关认证通过之后更新对应的token的最后更新时间
                    connection.query($sql.update_token_time, [tmp, userId], function (error, results) {
                        if (error) {
                            throw error
                        }
                        next()
                    })
                }
            } else {
                res.status(400).send(actions.formatResponse(400, '登录信息已经失效，请重新登陆', result, false))
            }
        })
    },
    // 获取用户信息的方法
    getUserInfo: function (req, res, next) {
        var data = Buffer.from(req.cookies.userId, 'base64').toString()
        pool.getConnection(function (err, connection) {
            if (err) {
                throw err
            }
            connection.query($sql.get_userInfo, [data], function (error, results) {
                if (error) {
                    throw error
                }
                if (!results.length) {
                    res.status(400).send(actions.formatResponse(400, '初始化信息失败'), results, false)
                } else {
                    res.send(actions.formatResponse(200, '获取信息成功', results, true))
                }
            })
        })
    },
    // 更新用户信息的方法
    updateUserInfo: function (req, res, next) {
        // 从cookie获取用户的ID
        console.log(req.body)
        var modify_time = new Date()
        var subData = Object.assign({}, req.body)
        subData.last_modify = modify_time
        var data = Buffer.from(req.cookies.userId, 'base64').toString()
        pool.getConnection(function (err, connection) {
            if (err) {
                throw err
            }
            connection.query($sql.update_userInfo, subData, function (error, results) {
                if (error) {
                    throw error
                }
                res.send(actions.formatResponse(200, '更新用户信息成功', results, true))
            })
        })
    }
}
module.exports = excuteFun