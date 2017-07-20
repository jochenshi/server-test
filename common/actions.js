var srypto = require('crypto')
//var base64url = require('base64url')
var secret_key = 'vue-end-encrypt'
var encrypt_key = 'aes-256-cbc'
var actions = {
    validateUser : function (data) {
        console.log(data)
    },
    // 无论在何时区，将时间转换为指定时区的方法,结果为时间戳
    getTimes: function (timeZone) {
        var nowZone = new Date().getTimezoneOffset()/60
        var zoneDiff = -(-timeZone - nowZone)
        var nowTime = + new Date()
        var finalTime = + new Date(nowTime + zoneDiff * 60 * 60 * 1000)
        return finalTime
    },
    // 统一数据返回的格式
    formatResponse: function (code, mess, data, result) {
        return {
            code: code,
            mess: mess,
            data: data,
            success: result
        }
    },

    //加密数据
    encryptData: function (data) {
        var cipher = srypto.createCipher(encrypt_key, secret_key)
        var encrypted = cipher.update(data, 'utf8', 'hex')
        return encrypted + cipher.final('hex')
    },

    // 解密数据
    decrypted: function (data) {
        var decipher = srypto.createDecipher(encrypt_key, secret_key)
        var decrypts = decipher.update(data, 'hex', 'utf8')
        return decrypts + decipher.final('utf8')
    },

    //base64编码
    encodeData: function (val) {
        return Buffer.from(JSON.stringify(val)).toString('base64')
    },

    //base64的解码
    decodeData: function (val) {
        var a = Buffer.from(val, 'base64').toString()
        return JSON.parse(a)
    },

    //生成JWT格式的token
    generateToken: function (account, userId, sigTime) {
        sigTime = sigTime || Date.now()
        var secret = 'sjcservertest'
        var header = {'typ': 'JWT', 'alg': 'HS256'}
        var payload = {
            iss: 'server-vue-end',
            iat: sigTime,
            account: actions.encryptData(account),
            userId: actions.encryptData(userId)
        }
        var baseHeader = actions.encodeData(header)
        var basePayload = actions.encodeData(payload)
        var encodeS = baseHeader + '.' + basePayload
        return encodeS + '.' + actions.encodeData(encodeS)
    },

    // 解密JWT格式的token
    decodeToken: function (val) {
        try {
            var arr = val.split('.')[2]
            var decode1 = actions.decodeData(arr).split('.')[1]
            var decode2 = actions.decodeData(decode1)
            var userId = Buffer.from(actions.decrypted(decode2.userId), 'base64').toString()
            return {userId: userId, account: actions.decrypted(decode2.account)}
        } catch (e) {
            return false
        }
    },

    excuteInser: function (connect, sql, data) {
        connect.query()
    },

    funcModel: function (req, res, next, flag) {
        return function (req, res, next) {}
    }
}

module.exports = actions