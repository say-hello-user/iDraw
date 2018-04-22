function drawImgDao(sqlDao){
    /**
     * 添加绘画过程中的图片信息 需要传入绘画者的email地址用来匹配该图片的所属用户信息
     * @param drawImg
     * @param cb
     */
    sqlDao.prototype.addDrawImg = function(jsonData,cb){
        var self = this;
        if(typeof jsonData !== 'object'){
            cb.call(this,'传入参数为非json对象 无法添加用户对应的绘图图片信息');
            return false;
        }
        var drawImgData = {
            email : jsonData['email'] ? jsonData['email'] : false, //图片对应的用户邮箱
            img_points_num : jsonData['img_points_num'] ? jsonData['img_points_num'] : 0, //图片的点赞数
            img_desc : jsonData['img_desc'] ? jsonData['img_desc'] : false, //图片描述
            img_url : jsonData['img_url'] ? jsonData['img_url'] : false //图片描述
        };
        for(var hasVal in drawImgData){
            if(typeof drawImgData[hasVal] === 'boolean'){
                cb.call(this,'缺少传入参数 无法添加用户对应的绘图图片信息');
                return false;
            }
        }

        var email = drawImgData['email'];
        self.getUserByEmail(email,function(rows){
            //找到该用户
            if(rows.length > 0){
                var postObj = {
                    user_id : rows[0]['user_id'],
                    img_points_num : drawImgData['img_points_num'],
                    img_desc : drawImgData['img_desc'],
                    img_url : drawImgData['img_url']
                };
                self.sqlPool.query('insert into draw_img_table set ?',postObj,function(err, result) {
                    if (err) {
                        throw err;
                    }
                    if(typeof cb === 'function'){
                        cb.call(this,result);
                    }
                });
            }
            else{
                cb.call(this,'没有找到当前用户，无法插入该图片');
            }
        });
    };

    /**
     * 更新当前绘画图片的信息
     * @param imgPointsNum
     * @param imgId
     * @param cb
     */
    sqlDao.prototype.updateDrawImg = function(imgPointsNum,imgId,cb){
        this.sqlPool.query('update draw_img_table set img_points_num = img_points_num + ? where img_id = ?',[imgPointsNum,imgId], function (err, result) {
            if (err) {
                throw err;
            }
            if (typeof cb === 'function') {
                cb.call(this, result);
            }
        });
    };

    /**
     *根据图片的点赞数 查询点赞数排名前counts的图片数量
     * @param counts
     * @param cb
     */
    sqlDao.prototype.getTopsImgByCounts = function(counts,cb){
        var count = typeof counts === 'number' ? counts : parseInt(counts);
        this.sqlPool.query('SELECT imgTb.img_url,imgTb.img_points_num,imgTb.img_desc,userTb.* FROM draw_img_table imgTb,user_table userTb where imgTb.user_id=userTb.user_id ' +
            'ORDER BY img_points_num DESC LIMIT ?',count, function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };
}

module.exports = drawImgDao;