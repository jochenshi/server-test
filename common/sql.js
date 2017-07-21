// 用于放置mysql语句的模板
var a = {
    check_register: 'SELECT * FROM `users` WHERE `account` = ? or `nickname` = ?',
    insert_register: 'INSERT INTO `users` SET ?',
    inset_userInfo: 'INSERT INTO `user_info` SET ?',
    check_account: 'SELECT * FROM `users` WHERE `account` = ?',
    check_login: 'SELECT * FROM `users` WHERE `account` = ? AND `password` = ?',
    insert_token: 'INSERT INTO `user_token` SET ?',
    get_token: 'SELECT * FROM `user_token` WHERE `userId` = ?',
    update_token: 'UPDATE `user_token` SET `token` = ?, `last_update` = ? WHERE `userId` = ?',
    update_token_time: 'UPDATE `user_token` SET `last_update` = ? WHERE `userId` = ?',
    get_userInfo: 'SELECT * FROM `user_info` WHERE `uId` = ?',
    update_userInfo: 'UPDATE `user_info` SET ?'
}
module.exports = a