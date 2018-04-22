function cache(){
    var redis = null;
    var initRedis = function(red){
        redis = red;
    };
    var addByKey = function(key,value){
        return redis.pipeline().mset(key,JSON.stringify(value)).exec();
    };
    var addByKeyArr = function(data){
        if(data instanceof Array){
            var pipe = redis.pipeline();
            for(var i = 0,l = data.length;i<l;i++){
                pipe.mset(data[i].key,JSON.stringify(data[i].value));
            }
            return pipe.exec();
        }
        else{
            return false;
        }
    };
    var deleteByKey = function(key){
        return redis.pipeline().del(key).exec();
    };
    var getByKey = function(key){
        var promise = redis.pipeline().mget(key).exec();
        return promise.then(function(results){
            var result = {};
            results[0] && results[0][1] && results[0][1][0] && (result = results[0][1][0]);
            return JSON.parse(result);
        });
    };
    var deleteAllKey =  function(){
        var stream = redis.scanStream();
        stream.on('data', function (resultKeys) {
            for (var i = 0; i < resultKeys.length; i++) {
                redis.del(resultKeys[i]);
            }
            console.log('已清空所有redis缓存');
        });
    };
    return {
        initRedis : initRedis,
        addByKey : addByKey,
        deleteByKey : deleteByKey,
        getByKey : getByKey,
        deleteAllKey : deleteAllKey,
        addByKeyArr : addByKeyArr
    };
}
module.exports = cache;