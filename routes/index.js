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
});

// get user info
router.get('/v1/user',function(req, res){
  connection.query('SELECT * from `user_table`', function (error, results, fields) {
    if (error) {
      throw error
    } else {
      res.send(results)
    }
  })
  //res.send({'message':'Hello user', 'user_id':'1', 'username':'testuser1'})
});

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


module.exports = router;


