var dao = require('../dataController/dao');

function initGetReq(router){
    //响应获取默认文件的get请求
    router.get('/', function(req, res) {
        if(req.session.email){
            //根据session获取当前已经登录用户的信息
            dao.getUserByEmail(req.session.email,function(rows){
                //如果查询结果没有有此用户则转至登录界面
                if(rows instanceof Array && rows.length === 0){
                    res.redirect('/loginPage');
                }
                else{
                    res.render('index',{serverName : encodeURI(req.session.serverName),
                        userName : encodeURI(rows[0]['user_name']),
                        email : encodeURI(req.session.email)});
                }
            });
        }
       else{
            res.redirect('/loginPage');
        }
    });



//响应获取选择服务区界面的get请求
    router.get('/selectServerPage', function(req, res) {
        res.render('selectServer');
    });

//响应注销用户get请求
    router.get('/cancle', function(req, res) {
        delete req.session.email;
        res.send('注销成功');
    });

//响应画廊获取前n名图片信息
    router.get('/getGalleryImg', function(req, res) {
        dao.getTopsImgByCounts(10,function(rows){
            dataValid(res,rows,'获取画廊信息错误');
        });
    });

//响应背包信息get请求
    router.get('/getUserPackGoods', function(req, res) {
        dao.getUserAllPackGoods(req.session.email,function(rows){
            dataValid(res,rows,'获取用户背包信息错误');
        });
    });

//响应获取商城所有商品信息get请求
    router.get('/getStoreAllGoods', function(req, res) {
        dao.getAllGoods(function(rows){
            dataValid(res,rows,'获取商城商品信息失败');
        });
    });

//响应获取魅力排行榜get请求
    router.get('/getCharmRank', function(req, res) {
        dao.getNumTopUser('charm_num',30,function(rows){
            dataValid(res,rows,'获取魅力排行榜信息失败');
        });
    });

//响应获取吐槽排行榜get请求
    router.get('/getSlotsRank', function(req, res) {
        dao.getNumTopUser('slots_num',30,function(rows){
            dataValid(res,rows,'获取吐槽排行榜信息失败');
        });
    });

//响应获取排行榜中我的信息get请求
    router.get('/getMyRankData', function(req, res) {
        var myRankData = {},num = 0;
        var sendRes = function(){
            if(num === 3){
                res.send(JSON.stringify(myRankData));
            }
        };
        dao.getUserByEmail(req.session.email,function(rows){
            myRankData['charm_num'] = rows[0]['charm_num'];
            num++;
            sendRes();
        });

        dao.getGiveMeMoreUser(req.session.email,function(rows){
            var result = rows instanceof Array ? rows[0] : null;
            if(result){
                myRankData['giveMeMoreUser'] = result;
            }
            num++;
            sendRes();
        });

        dao.getMeGiveMoreUser(req.session.email,function(rows){
            var result = rows instanceof Array ? rows[0] : null;
            if(result){
                myRankData['meGiveMoreUser'] = result;
            }
            num++;
            sendRes();
        });

    });

    router.get('/getFriendList',function(req,res){
        dao.getFriendList(req.session.email,function(rows){
            dataValid(res,rows,'获取好友信息失败');
        });
    });

    router.get('/getFriendReq',function(req,res){
        dao.getFriendReq(req.session.email,function(rows){
            dataValid(res,rows,'获取好友信息失败');
        });
    });
}

function dataValid(res,rows,errorMsg){
    var postData = {
        data:rows
    };
    if(rows instanceof Array){
        if(rows.length > 0){
            postData['status'] = 200;
        }
        else{
            postData['status'] = 404;
        }
    }
    else{
        postData['status'] = 500;
        postData['errorMsg'] = errorMsg;
    }
    res.send(JSON.stringify(postData));
}

module.exports = initGetReq;