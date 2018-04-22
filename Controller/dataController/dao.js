var mysqlPool = require('./dataBaseInit');
var userDao = require('./userDao');
var userPackDao = require('./userPackDao');
var matchDataDao = require('./matchDataDao');
var keyWordDao = require('./keyWordDao');
var goodsDao = require('./goodsDao');
var friendDao = require('./friendDao');
var drawImgDao = require('./drawImgDao');

function sqlDao(){
    this.sqlPool = mysqlPool.getPool();
}

userDao(sqlDao);
userPackDao(sqlDao);
matchDataDao(sqlDao);
keyWordDao(sqlDao);
goodsDao(sqlDao);
friendDao(sqlDao);
drawImgDao(sqlDao);

var sqlDao = new sqlDao();
module.exports = sqlDao;