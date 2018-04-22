function keyWordDao(sqlDao){
    /**
     * 查询词汇表 随机获取一个词汇信息
     * @param cb
     */
    sqlDao.prototype.getRandomKeyWord = function(cb){
        this.sqlPool.query('SELECT * ' + 'FROM `word_table` AS t1 JOIN (SELECT ROUND(RAND() * (SELECT MAX(word_id) FROM `word_table`)) AS word_id) AS t2 ' +
            'WHERE t1.word_id >= t2.word_id ' + 'ORDER BY t1.word_id ASC LIMIT 1', function(err, rows, fields) {
            if (err) {
                throw err;
            }
            if(typeof cb === 'function'){
                cb.call(this,rows);
            }
        });
    };

    sqlDao.prototype.addKeyWord = function(words,cb){
        if(typeof words === 'object'){
            var postObj = {
                word_detail : words['word_detail'] ? words['word_detail'] : '默认关键词',
                word_num : words['word_num'] ? words['word_num'] : 5,
                word_type : words['word_type'] ? words['word_type'] : '无',
                word_tips : words['word_tips'] ? words['word_tips'] : '无'
            };
            this.sqlPool.query('insert into word_table set ?',postObj,function(err, result) {
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
}

module.exports = keyWordDao;