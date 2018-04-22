function userPackDao(sqlDao){
    /**
     * 获取用户所有的背包商品信息
     */
    sqlDao.prototype.getUserAllPackGoods = function(email,cb){
        var self = this;
        self.getUserByEmail(email,function(rows) {
            var userId = rows[0]['user_id'];
            self.sqlPool.query('select pack_table.*,goods_table.* from pack_table,goods_table where pack_table.pack_id in ( SELECT pack_id FROM pack_table where user_id = ?) and ' +
                'pack_table.goods_id = goods_table.goods_id', userId,function(err, rows, fields) {
                if (err) {
                    throw err;
                }
                if(typeof cb === 'function'){
                    cb.call(this,rows);
                }
            });
        });
    };

    /**
     * 根据用户邮箱地址,商品ID 获取用户背包信息
     * @param email
     * @param goods_id
     * @param cb
     */
    sqlDao.prototype.getPackByEmailGoodsId = function(email,goods_id,cb){
        var self = this;
        this.getUserByEmail(email,function(rows){
            var userId = rows[0]['user_id'];
            self.sqlPool.query('SELECT * FROM pack_table where user_id = ? and goods_id = ?',[userId,goods_id], function(err, rows, fields) {
                if (err) {
                    throw err;
                }
                if(typeof cb === 'function'){
                    cb.call(this,rows);
                }
            });
        });
    };

    /**
     * 创建用户的背包信息 根据传入的email来关联当前背包所属的用户
     * @param jsonData
     * @param cb
     */
    sqlDao.prototype.addUserPack = function(jsonData,cb){
        var self = this;
        if(typeof jsonData !== 'object'){
            cb.call(this,'传入参数为非json对象 无法增加用户背包商品数量');
            return false;
        }
        var addPackData = {
            email : jsonData['email'] ? jsonData['email'] : false, //需要增加的商品对应的用户邮箱
            goods_id : jsonData['goods_id'] ? jsonData['goods_id'] : false, //需要增加的商品id
            addNum : jsonData['addNum'] ? jsonData['addNum'] : false //需要增加的商品数量
        };
        for(var hasVal in addPackData){
            if(typeof addPackData[hasVal] === 'boolean'){
                cb.call(this,'缺少传入参数 无法增加用户背包商品数量');
                return false;
            }
        }
        var email = addPackData['email'];
        self.getPackByEmailGoodsId(email,addPackData['goods_id'],function(result){
            self.getUserByEmail(email,function(rows) {
                var num = result.length > 0 ? result[0]['goods_num'] : 0;
                var postObj = {
                    user_id: rows[0]['user_id'],
                    goods_id: addPackData['goods_id'],
                    goods_num: addPackData['addNum'] + num
                };
                //如果用户背包中有此商品  则更新该商品数量
                if (result.length > 0) {
                    self.sqlPool.query('update pack_table set goods_num = ? where user_id = ? and goods_id = ?', [postObj.goods_num, postObj.user_id, postObj.goods_id], function (err, result) {
                        if (err) {
                            throw err;
                        }
                        if (typeof cb === 'function') {
                            cb.call(this, result);
                        }
                    });
                }
                //如果用户背包中没有此商品 则在背包中增加该商品
                else {
                    self.sqlPool.query('insert into pack_table set ?', postObj, function (err, result) {
                        if (err) {
                            throw err;
                        }
                        if (typeof cb === 'function') {
                            cb.call(this, result);
                        }
                    });
                }
            });
        });
    };

    /**
     * 减少用户背包某个商品的数量
     * @param jsonData
     * @param cb
     */
    sqlDao.prototype.reduceUserPack = function(jsonData,cb){
        var self = this;
        if(typeof jsonData !== 'object'){
            cb.call(this,'传入参数为非json对象 无法减少用户背包商品数量');
            return false;
        }
        var delPackData = {
            email : jsonData['email'] ? jsonData['email'] : false, //需要减少的商品对应的用户邮箱
            goods_id : jsonData['goods_id'] ? jsonData['goods_id'] : false, //需要减少的商品id
            reduceNum : jsonData['reduceNum'] ? jsonData['reduceNum'] : false //需要减少的商品数量
        };
        for(var hasVal in delPackData){
            if(typeof delPackData[hasVal] === 'boolean'){
                cb.call(this,'缺少传入参数 无法减少用户背包商品数量');
                return false;
            }
        }
        var email = delPackData['email'];
        self.getPackByEmailGoodsId(email,delPackData['goods_id'],function(result){
            if(result.length > 0){
                var hasGoodsNum = result[0]['goods_num'];//原来的商品数量
                var delGoodsNum = delPackData['reduceNum'];//需要减少的商品数量
                //如果用户背包的商品数量小于需要减少的商品数量 则无法减少
                if(hasGoodsNum < delGoodsNum){
                    cb.call(this,'用户该商品数量不足，无法减少');
                }
                else{
                    self.getUserByEmail(email,function(rows) {
                        var nowGoodsNum = hasGoodsNum - delGoodsNum;
                        var userId = rows[0]['user_id'];
                        //如果减少完还有剩下商品 则更新商品数量
                        if(nowGoodsNum){
                            self.sqlPool.query('update pack_table set goods_num = ? where user_id = ? and goods_id = ?', [nowGoodsNum,userId, delPackData.goods_id], function (err, result) {
                                if (err) {
                                    throw err;
                                }
                                if (typeof cb === 'function') {
                                    cb.call(this, result);
                                }
                            });
                        }
                        //如果减少完 商品数量为0 则删除此条背包中商品
                        else{
                            self.sqlPool.query('DELETE FROM pack_table WHERE user_id = ? and goods_id = ?', [userId, delPackData.goods_id], function (err, result) {
                                if (err) {
                                    throw err;
                                }
                                if (typeof cb === 'function') {
                                    cb.call(this, result);
                                }
                            });
                        }
                    });
                }
            }
            else{
                cb.call(this,'对不起，您的该商品数量不足，无法使用');
            }
        });
    };

}

module.exports = userPackDao;