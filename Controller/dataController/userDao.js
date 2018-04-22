function userDao(sqlDao){
    /**
     * 添加用户
     * @param user
     * @param cb
     */
    sqlDao.prototype.addUser = function(user,cb){
        if(typeof user === 'object'){
            var postObj = {
                email : user['email'] ? user['email'] : '',
                pass_word : user['pass_word'] ? user['pass_word'] : '',
                user_name : user['user_name'] ? user['user_name'] : '默认名称',
                sex : user['sex'] ? user['sex'] : '男',
                head_url : user['head_url'] ? user['head_url'] : '',
                gold_num : user['gold_num'] ? user['gold_num'] : 1000,
                charm_num : user['charm_num'] ? user['charm_num'] : 0,
                slots_num : user['slots_num'] ? user['slots_num'] : 0,
                code : user['code'],
                date : new Date().getTime(),
                islive : 0
            };
            this.sqlPool.query('insert into user_table set ?',postObj,function(err, result) {
                if (err) {
                    throw err;
                }
                if(typeof cb === 'function'){
                    cb.call(this,result);
                }
            });
        }
        else{
            cb.call(this,'插入错误，传入的为非json格式对象');
        }
    };

    /**
     * 更改用户的字段信息  直接更改  不在原来的值上增加 userData 需要更改的用户信息  必须包含用户email 用来查询到该用户
     * @param userData
     * @param cb
     */
    sqlDao.prototype.changeUserData = function(userData,cb){
        if(typeof userData !== 'object'){
            cb.call(this,'传入参数为非json对象 无法修改用户信息');
            return false;
        }
        var userIndexKey = userData.email ? userData.email : userData.user_id;
        var userIndexVal = userData.email ? 'email' : 'user_id';
        if(!userIndexKey){
            cb.call(this, '需要传入email或者user_id数值');
        }
        var userTableKeys = ['pass_word','user_name','sex','head_url','gold_num','charm_num','slots_num','islive'];
        for(var key in userData){
            if(userTableKeys.indexOf(key) === -1){
                delete userData[key];
            }
        }
        this.sqlPool.query('update user_table set ? where ?? = ?',[userData,userIndexVal,userIndexKey], function (err, result) {
            if (err) {
                throw err;
            }
            if (typeof cb === 'function') {
                cb.call(this, result);
            }
        });
    };

    /**
     * 更新用户数值信息 在原来数值上面增加或者减少
     * addOrReduce 为true为增加操作 为false为减少操作
     * @param userData
     * @param cb
     * @returns {boolean}
     */
    sqlDao.prototype.updateUserData = function(userData,addOrReduce,cb){
        if(typeof userData !== 'object'){
            cb.call(this,'传入参数为非json对象 无法修改用户信息');
            return false;
        }
        var userIndexKey = userData.email ? userData.email : userData.user_id;
        var userIndexVal = userData.email ? 'email' : 'user_id';
        var addOrReduceSymbol = addOrReduce ? '+' : '-';
        if(!userIndexKey){
            cb.call(this, '需要传入email或者user_id数值');
        }
        var userTableKeys = ['gold_num','charm_num','slots_num'];
        var hasVal = false;
        for(var key in userData){
            if(userTableKeys.indexOf(key) === -1){
                delete userData[key];
            }
            hasVal = true;
        }
        if(!hasVal){
            cb.call(this,'没有信息更改');
            return false;
        }
        var sql = 'update user_table set ';
        var updateDataArr = [];
        for(key in userData){
            sql += (key + ' = ' + key + addOrReduceSymbol +' ?,');
            updateDataArr.push(userData[key]);
        }
        sql = sql.substring(0,sql.length - 1) + ' where ?? = ?';
        updateDataArr.push(userIndexVal);
        updateDataArr.push(userIndexKey);
        this.sqlPool.query(sql,updateDataArr, function (err, result) {
            if (err) {
                throw err;
            }
            if (typeof cb === 'function') {
                cb.call(this, result);
            }
        });
    };

    /**
     * 根据用户user_id获取用户信息
     * @param id
     * @param cb
     */
    sqlDao.prototype.getUserById = function(id,cb){
        this.sqlPool.query('SELECT * FROM user_table where user_id = ?',id, function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };

    /**
     * 根据用户邮箱数组获取信息
     * @param eMail
     * @param cb
     */
    sqlDao.prototype.getUsersByEmailArr = function(emailArr,cb){
        if(emailArr instanceof Array && emailArr.length > 0){
            var emailText = '';
            for(var i = 0,l = emailArr.length;i < l;i++){
                emailText += '"'+emailArr[i] + '",';
            }
            emailText = emailText.substring(0,emailText.length - 1);
            var query = 'SELECT * FROM user_table WHERE email IN ('+(emailText)+')';
            var pol = this.sqlPool.query(query, function(err, rows, fields) {
                if (err) {
                    throw err;
                }
                if(typeof cb === 'function'){
                    cb.call(this,rows);
                }
            });
        }
        else{
            if(typeof cb === 'function'){
                cb.call(this,"传入的不为数组，查询错误");
            }
        }
    };

    /**
     * 根据用户邮箱获取信息
     * @param eMail
     * @param cb
     */
    sqlDao.prototype.getUserByEmail = function(eMail,cb){
        this.sqlPool.query('SELECT * FROM user_table where email = ?',eMail, function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };

    sqlDao.prototype.getUserByFuzzy = function(fuzzyQuery,cb){
        var sql = 'SELECT * FROM user_table WHERE user_name like ' + "'%" + fuzzyQuery + "%'";
        this.sqlPool.query(sql, function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };

    /**
     *获取所有用户信息
     * @param cb
     */
    sqlDao.prototype.getAllUsers = function(cb){
        this.sqlPool.query('SELECT * FROM user_table', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };

    /**
     * 获取用户表 根据 orderBy的值  查出 用户表 orderBy 值 前 num 名
     */
    sqlDao.prototype.getNumTopUser = function(orderBy,num,cb){
        this.sqlPool.query('select * from user_table ORDER BY ?? desc LIMIT 0,?',[orderBy,num],function(err, result) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,result);
            }
        });
    };
}

module.exports = userDao;