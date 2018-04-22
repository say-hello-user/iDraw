var formidable = require("formidable");
var path = require('path');
var fs = require('fs');
var dao = require('../dataController/dao');

function initPostReq(router){
    router.post('/agreeFriReq', function(req, res) {
        var email = req.body.friendUser;
        dao.updateFriendList({userEmail : req.session.email,friendEmail : email},function(rows){
            if(typeof rows === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : '添加好友失败'}));
            }
        });
    });

    router.post('/rejectFriReq', function(req, res) {
        var email = req.body.friendUser;
        dao.delFriById({userEmail : req.session.email,friendEmail : email},function(rows){
            if(typeof rows === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : '拒绝好友请求失败'}));
            }
        });
    });

    router.post('/getUserByFuzzy', function(req, res) {
        var fuzzyQuery = req.body.fuzzyQuery;
        dao.getUserByFuzzy(fuzzyQuery,function(rows){
            dataValid(res,rows,'获取用户信息失败');
        });
    });



//响应更新用户
    router.post('/updateUser', function(req, res) {
        var email = req.body.email ? req.body.email : req.session.email;
        var updateJson = JSON.parse(req.body.updateData);
        var isReduce = !!req.body.isReduce;
        var result = {email : email};
        for(var key in updateJson){
            result[key] = updateJson[key];
        }
        dao.updateUserData(result,!isReduce,function(result){
            if(typeof  result === 'string'){
                res.send(JSON.stringify({status : 500,errorMsg : '更新用户信息错误'}));
            }
            else{
                res.send(JSON.stringify({status : 200}));
            }
        });
    });

//响应购买商品post请求
    router.post('/buyGoods',function(req,res){
        var goodsId = req.body.goodsId;
        dao.getGoodsById(goodsId,function(goodRows){
            dao.getUserByEmail(req.session.email,function(userRows){
                var goodsPrice = goodRows[0]['goods_price'],
                    userGoldOwn = userRows[0]['gold_num'];
                if(userGoldOwn < goodsPrice){
                    res.send(JSON.stringify({status : 500 , errorMsg : '您的金币余额不足，不能购买'}));
                }
                else{
                    dao.addUserPack({email:req.session.email,goods_id : goodsId,addNum:1},function(data){
                        dao.updateUserData({email:req.session.email,gold_num:goodsPrice},false,function(data){
                            res.send(JSON.stringify({status : 200}));
                        });
                    });
                }
            });
        });
    });

//响应添加用户背包数据post请求
    router.post('/addUserGoods',function(req,res){
        var goodsId = req.body.goodsId;
        dao.addUserPack({email:req.session.email,goods_id : goodsId,addNum:1},function(result){
            if(typeof result === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : result}));
            }
        });
    });

//响应减少用户背包数据post请求
    router.post('/reduceUserGoods',function(req,res){
        var goodsId = req.body.goodsId;
        dao.reduceUserPack({email:req.session.email,goods_id : goodsId,reduceNum:1},function(result){
            if(typeof result === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : result}));
            }
        });
    });

//更新作画者图片的绘画信息
    router.post('/updateImgData', function(req, res) {
        var imgId = parseInt(req.body.imgId);
        dao.updateDrawImg(1,imgId,function(result){
            if(typeof result === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : result}));
            }
        });
    });

//添加比赛信息 添加道具赠送信息
    router.post('/addMatchData',function(req,res){
        var data = req.body;
        data['guess_user_email'] = req.session.email;
        if(data.goodsId !== -1){
            dao.addMatch(data,function(result){
                if(typeof result === 'object'){
                    res.send(JSON.stringify({status : 200}));
                }
                else{
                    res.send(JSON.stringify({status : 500,errorMsg : result}));
                }
            });
        }
        else{
            res.send(JSON.stringify({status : 500,errorMsg : '对不起，您的道具数量不足无法赠送'}));
        }
    });

//响应上传绘画图片post请求
    router.post('/uploadPaintImg', function(req, res) {
        var fields=[];
        var files=[];
        var fileName = new Date().getTime()+ '.jpg';
        var form = new formidable.IncomingForm(),
            targetDir = path.join(__dirname, '../../upload/paint/' + req.session.email + '/');
        if (!fs.existsSync(targetDir)) {
            fs.mkdir(targetDir);
        }
        form.encoding = 'utf-8';
        form.maxFieldsSize = 2 * 1024 * 1024;
        form.keepExtensions= true; //保留后缀格式
        form.uploadDir = targetDir;
        form
            .on('field', function(field,value){
                fields.push({field : field,value : value});
            })
            .on('file', function(field,value){
                files.push({field : field,value : value});
            })
            .on('end', function(){
                var tmp = files[0].value,
                    fileNameDir = form.uploadDir + fileName;
                fs.rename(tmp.path,fileNameDir,function(err){
                    if(err){
                        throw err;
                    }
                    console.log('上传绘图成功');
                });
            });
        form.parse(req);
        dao.addDrawImg({email:req.session.email,img_points_num:0,img_desc:'图片描述',img_url:req.session.email + '/' +fileName},function(result){
            var insertId = result.insertId;
            res.send(insertId.toString());
        });
    });

//响应选择服务区post请求
    router.post('/selectServer',function(req,res){
        var serverName = req.body.serverName;
        req.session.serverName = serverName;
        res.send("选择成功");
    });

//响应更换头像post请求
    router.post('/changeUserHead', function(req, res) {
        var fields=[];
        var files=[];
        var form = new formidable.IncomingForm(),
            targetDir = path.join(__dirname, '../../upload/head/');
        form.encoding = 'utf-8';
        form.maxFieldsSize = 2 * 1024 * 1024;
        form.keepExtensions= true; //保留后缀格式
        form.uploadDir = targetDir;
        var fileName = new Date().getTime()+ '.jpg';

        dao.getUserByEmail(req.session.email,function(rows){
            if(rows instanceof Array && rows.length > 0){
                var user = rows[0],
                    oldPath = form.uploadDir + user['head_url'];
                console.log(user['head_url'])
                if(user['head_url'] !== 'defaultBoy.jpg' && user['head_url'] !== 'defaultGirl.jpg'){
                    fs.exists(oldPath, function(exists) {
                        if(exists){
                            fs.unlink(oldPath, function (err) {
                                if (err) return console.log(err);
                                console.log('旧头像图片删除成功');
                            });
                        }
                        else{
                            console.log("未找到改文件，删除失败");
                        }
                    });
                }
                form
                    .on('field', function(field,value){
                        fields.push({field : field,value : value});
                    })
                    .on('file', function(field,value){
                        files.push({field : field,value : value});
                    })
                    .on('end', function(){
                        var tmp = files[0].value,
                            fileNameDir = form.uploadDir + fileName;
                        fs.rename(tmp.path,fileNameDir,function(err){
                            if(err){
                                throw err;
                            }
                            dao.changeUserData({email:req.session.email,head_url : fileName},function(result){
                                if(typeof result === 'object'){
                                    console.log('更改头像成功');
                                    res.send(JSON.stringify({status : 200}));
                                }
                                else{
                                    res.send(JSON.stringify({status : 500,errorMsg:'更改头像失败，请稍后再试'}));
                                }
                            });
                        });
                    });
                form.parse(req);
            }
        });
    });

//响应请求房间内用户信息
    router.post('/getRoomUsersData', function(req, res) {
        var emailStr = req.body.emailArr;
        var emailArr = emailStr.split(',');
        dao.getUsersByEmailArr(emailArr,function(rows){
            dataValid(res,rows,'获取房间用户信息错误');
        })
    });

//响应请求房间内用户信息
    router.post('/addFriend', function(req, res) {
        var friendEmail = req.body.friendEmail;
        dao.addFriend({userEmail : req.session.email,friendEmail : friendEmail},function(rows){
            if(typeof rows === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : rows}));
            }
        })
    });

    router.post('/delFriend', function(req, res) {
        var friendEmail = req.body.friendEmail;
        dao.delFriend({userEmail : req.session.email,friendEmail : friendEmail},function(rows){
            if(typeof rows === 'object'){
                res.send(JSON.stringify({status : 200}));
            }
            else{
                res.send(JSON.stringify({status : 500,errorMsg : rows}));
            }
        })
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

module.exports = initPostReq;