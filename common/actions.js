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
    }
}

module.exports = actions