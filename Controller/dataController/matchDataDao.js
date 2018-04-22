function matchDataDao(sqlDao){
    /**
     * 添加比赛道具交互信息
     * @param jsonData
     * @param cb
     */
    sqlDao.prototype.addMatch = function(jsonData,cb){
        var self = this;
        if(typeof jsonData !== 'object'){
            cb.call(this,'传入参数为非json对象 无法添加比赛信息');
            return false;
        }
        var reduceGoodsId = jsonData['reduceGoodsId'] ? jsonData['reduceGoodsId'] : false;
        if(typeof reduceGoodsId === 'boolean'){
            cb.call(this,'缺少参数，赠送道具失败');
            return false;
        }
        var matchData = {
            paint_user_email : jsonData['paint_user_email'] ? jsonData['paint_user_email'] : false, //绘画者邮箱
            guess_user_email: jsonData['guess_user_email'] ? jsonData['guess_user_email'] : false, //猜词者邮箱
            give_charm_num : jsonData['give_charm_num'] ? jsonData['give_charm_num'] : 0, //赠送的魅力数
            give_slots_num : jsonData['give_slots_num'] ? jsonData['give_slots_num'] : 0 //赠送的番茄吐槽数
        };
        for(var hasVal in matchData){
            if(typeof matchData[hasVal] === 'boolean'){
                cb.call(this,'缺少传入参数 无法添加比赛信息');
                return false;
            }
        }
        var num = 0 ;
        var paint_user_email = matchData.paint_user_email;
        var guess_user_email = matchData.guess_user_email;
        delete matchData.paint_user_email;
        delete matchData.guess_user_email;
        var dealData = function(){
            if(num === 2){
                self.sqlPool.query('select * from match_table where paint_user = ? and guess_user = ?',[matchData['paint_user'],matchData['guess_user']],function(err, rows) {
                    if (err) {
                        throw err;
                    }
                    if(rows.length > 0){
                        self.sqlPool.query('update match_table set give_charm_num = give_charm_num + ?,give_slots_num = give_slots_num + ? where paint_user = ? and guess_user = ?',
                            [matchData.give_charm_num,matchData.give_slots_num,matchData['paint_user'],matchData['guess_user']],function(err, result) {
                                if (err) {
                                    throw err;
                                }
                                if(typeof cb === 'function'){
                                    cb.call(this,result);
                                }
                            });
                    }
                    else{
                        self.sqlPool.query('insert into match_table set ?',matchData,function(err, result) {
                            if (err) {
                                throw err;
                            }
                            if(typeof cb === 'function'){
                                cb.call(this,result);
                            }
                        });
                    }
                });
            }
        };
        self.getUserByEmail(paint_user_email,function(rows) {
            matchData['paint_user'] = rows[0]['user_id'];
            num++;
            dealData();
        });
        self.getUserByEmail(guess_user_email,function(rows) {
            matchData['guess_user'] = rows[0]['user_id'];
            num++;
            dealData();
        });

        //更新作图者的魅力值或者吐槽值信息
        self.updateUserData({email:paint_user_email,
            charm_num : matchData['give_charm_num'],
            slots_num : matchData['give_slots_num']},true,function(){});

        //更新猜词者的道具信息
        self.reduceUserPack({email: guess_user_email,goods_id : reduceGoodsId,reduceNum:1},function(){});
    };

    /**
     * 获取给我赠送魅力值道具最多的用户
     * @param email
     * @param cb
     */
    sqlDao.prototype.getGiveMeMoreUser = function(email,cb){
        var self = this;
        self.getUserByEmail(email,function(rows) {
            var userId = rows[0]['user_id'];
            if(userId){
                self.sqlPool.query('select * from match_table where paint_user = ? ORDER BY give_charm_num desc limit 0,1;',userId, function (err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    if (typeof cb === 'function') {
                        var giveMeMoreUserId = rows.length > 0 ? rows[0]['guess_user'] : null;
                        if(giveMeMoreUserId){
                            self.getUserById(giveMeMoreUserId,cb);
                        }
                        else{
                            cb.call(this, null);
                        }
                    }
                });
            }
            else{
                cb.call(this, '输入用户邮箱错误无法找到该用户');
            }
        })
    };

    /**
     * 获取我赠送魅力值道具最多的人
     * @param email
     * @param cb
     */
    sqlDao.prototype.getMeGiveMoreUser = function(email,cb){
        var self = this;
        self.getUserByEmail(email,function(rows) {
            var userId = rows[0]['user_id'];
            if(userId) {
                self.sqlPool.query('select * from match_table where guess_user = ? ORDER BY give_charm_num desc limit 0,1;', userId, function (err, rows, fields) {
                    if (err) {
                        throw err;
                    }
                    if (typeof cb === 'function') {
                        var meGiveMoreUserId = rows.length > 0 ? rows[0]['paint_user'] : null;
                        if(meGiveMoreUserId){
                            self.getUserById(meGiveMoreUserId,cb);
                        }
                        else{
                            cb.call(this, null);
                        }
                    }
                });
            }
            else{
                cb.call(this, '输入用户邮箱错误无法找到该用户');
            }
        });
    };
}

module.exports = matchDataDao;