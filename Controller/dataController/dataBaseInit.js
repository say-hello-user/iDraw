var mysql = require('mysql');
function initMysqlPool(){
    this.mysqlPara = {
        host : '127.0.0.1',
        database : 'ipaint',
        user : 'root',
        password : 'root'
    };
    this.pool =  null;
    this.connect();
}
initMysqlPool.prototype.connect = function(){
    this.pool =  mysql.createPool(this.mysqlPara);
};
initMysqlPool.prototype.getPool = function(){
    return this.pool;
};

var serverPool = new initMysqlPool();

module.exports = serverPool;


