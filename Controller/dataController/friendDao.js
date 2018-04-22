function friendDao(sqlDao){
    sqlDao.prototype.updateFriendList = function(jsonData,cb){
        var self = this;
        if(typeof jsonData === 'object'){
            self.getUserByEmail(jsonData.userEmail,function(rows) {
                var userId = rows[0]['user_id'];
                self.getUserByEmail(jsonData.friendEmail,function(rows) {
                    self.sqlPool.query('insert into friend_table set ?',{user : userId, friend_user : rows[0]['user_id'],is_agree: 1},function(err, result) {
                        if (err) {
                            throw err;
                        }
                        self.sqlPool.query('update friend_table set is_agree = 1 where friend_user = ? and user = ?',[userId,rows[0]['user_id']],function(err, result) {
                            if (err) {
                                throw err;
                            }
                            if(typeof cb === 'function'){
                                cb.call(this,result);
                            }
                        });
                    });
                });
            });
        }
        else{
            cb.call(this,'传入参数非对象');
        }
    };

    sqlDao.prototype.delFriById = function(jsonData,cb){
        var self = this;
        if(typeof jsonData === 'object'){
            self.getUserByEmail(jsonData.userEmail,function(rows) {
                var userId = rows[0]['user_id'];
                self.getUserByEmail(jsonData.friendEmail,function(rows) {
                    self.sqlPool.query('delete from friend_table where friend_user = ? and user = ?',[userId,rows[0]['user_id']],function(err, result) {
                        if (err) {
                            throw err;
                        }
                        if(typeof cb === 'function'){
                            cb.call(this,result);
                        }
                    });
                });
            });
        }
        else{
            cb.call(this,'传入参数非对象');
        }
    };

    sqlDao.prototype.getFriendReq = function(email,cb){
        var self = this;
        if(email){
            self.getUserByEmail(email,function(rows) {
                var userId = rows[0]['user_id'];
                self.sqlPool.query('select * from user_table where user_id in(select user from friend_table where friend_user = ? and is_agree = 0)',userId, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    if(typeof cb === 'function'){
                        cb.call(this,rows);
                    }
                });
            });
        }
        else{
            cb.call(this,'邮箱未传入');
        }
    };

    sqlDao.prototype.getFriendList = function(email,cb){
        var self = this;
        if(email){
            self.getUserByEmail(email,function(rows) {
                var userId = rows[0]['user_id'];
                self.sqlPool.query('select * from user_table where user_id in(select friend_user from friend_table where user = ? and is_agree = 1)',userId, function(err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    if(typeof cb === 'function'){
                        cb.call(this,rows);
                    }
                });
            });
        }
        else{
            cb.call(this,'邮箱未传入');
        }
    };

    sqlDao.prototype.addFriend = function(jsonData,cb){
        var self = this;
        if(typeof jsonData === 'object'){
            self.getUserByEmail(jsonData.userEmail,function(rows) {
                var userId = rows[0]['user_id'];
                self.getUserByEmail(jsonData.friendEmail,function(rows) {
                    self.sqlPool.query('select * from friend_table where user = ? and friend_user = ?',[userId,rows[0]['user_id']],function(err, result) {
                        if (err) {
                            throw err;
                        }
                        if(result.length > 0){
                            if(typeof cb === 'function'){
                                cb.call(this,'您已经添加此好友，无需重复添加');
                            }
                        }
                        else{
                            self.sqlPool.query('insert into friend_table set ?',{user : userId, friend_user : rows[0]['user_id']},function(err, result) {
                                if (err) {
                                    throw err;
                                }
                                if(typeof cb === 'function'){
                                    cb.call(this,result);
                                }
                            });
                        }
                    });
                });
            });
        }
        else{
            cb.call(this,'传入参数非对象');
        }
    };

    sqlDao.prototype.delFriend = function(jsonData,cb){
        var self = this;
        if(typeof jsonData === 'object'){
            self.getUserByEmail(jsonData.userEmail,function(rows) {
                var userId = rows[0]['user_id'];
                self.getUserByEmail(jsonData.friendEmail,function(rows){
                    self.sqlPool.query('delete  from friend_table where user = ? and friend_user = ?',[userId,rows[0]['user_id']],function(err, result) {
                        if (err) {
                            throw err;
                        }
                        self.sqlPool.query('delete  from friend_table where user = ? and friend_user = ?',[rows[0]['user_id'],userId],function(err, result) {
                            if (err) {
                                throw err;
                            }
                            if(typeof cb === 'function'){
                                cb.call(this,result);
                            }
                        });
                    });
                });
            });
        }
        else{
            cb.call(this,'传入参数非对象');
        }
    };
}

module.exports = friendDao;