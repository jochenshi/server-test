var srypto = require('crypto')
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
    formatResponse: function (code, mess, data) {
        return {
            code: code,
            mess: mess,
            data: data
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
    }
}

module.exports = actions