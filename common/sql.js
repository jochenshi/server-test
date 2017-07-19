// 用于放置mysql语句的模板
var a = {
    check_register: 'SELECT * FROM `users` WHERE `account` = ? or `nickname` = ?',
    insert_register: 'INSERT INTO `users` SET ?',
    check_login: 'SELECT * FROM `users` WHERE `account` = ?',
    insert_token: 'INSERT INTO `user_token` SET ?',
    get_token: 'SELECT * FROM `user_token` WHERE `userId` = ?'
}
module.exports = a