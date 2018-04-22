function goodsDao(sqlDao){
    /**
     * 添加商品
     * @param goods
     * @param cb
     */
    sqlDao.prototype.addGoods = function(goods,cb){
        if(typeof goods === 'object'){
            var postObj = {
                goods_name : goods['goods_name'] ? goods['goods_name'] : '默认商品名称',
                goods_price : goods['goods_price'] ? goods['goods_price'] : 0,
                goods_desc : goods['goods_desc'] ? goods['goods_desc'] : '默认商品描述',
                goods_img : goods['goods_img'] ? goods['goods_img'] : '空'
            };
            this.sqlPool.query('insert into goods_table set ?',postObj,function(err, result) {
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
     *根据商品goods_id获取对应的商品信息
     * @param id
     * @param cb
     */
    sqlDao.prototype.getGoodsById = function(id,cb){
        this.sqlPool.query('SELECT * FROM goods_table where goods_id = ?',id, function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };

    /**
     * 获取所有的商品信息
     * @param cb
     */
    sqlDao.prototype.getAllGoods = function(cb){
        this.sqlPool.query('SELECT * FROM goods_table', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };
}

module.exports = goodsDao;