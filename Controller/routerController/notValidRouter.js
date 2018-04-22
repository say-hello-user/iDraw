var formidable = require("formidable");
var path = require('path');
var fs = require('fs');
var send = require('../../Util/email');
var rsa = require('../../Util/rsa');
var crypto = require("crypto");
var dao = require('../dataController/dao');

function initNotValidRouter(router){

    //响应获取登录界面的get请求
    router.get('/loginPage', function(req, res) {
        res.render('login');
    });

    //响应获取注册界面的get请求
    router.get('/registerPage', function(req, res) {
        res.render('register');
    });

    //响应处理激活账号请求
    router.get('/checkCode',function(req,res){
        var email = req.query.email,
            code = req.query.code;
        dao.getUserByEmail(email, function (rows){
            if(rows instanceof Array && rows.length > 0){
                var user = rows[0];
                if(parseInt(user.code) == code && (Date.now() - parseInt(user.date) < 86400000)){
                    dao.changeUserData({email: email,islive : 1}, function (result){
                        if(typeof result === 'object'){
                            res.render('tips',{userName : user['user_name'],tipsText : '激活成功'});
                        }
                        else{
                            res.render('tips',{userName : user['user_name'],tipsText : '激活失败,激活链接已失效'});
                        }
                    });
                }
            }
        });
    });

    //响应获取当前用户信息get请求
    router.post('/getUserDataByEmail', function(req, res) {
        var email = req.body.email;
        if(email){
            dao.getUserByEmail(email,function(rows){
                dataValid(res,rows,'获取用户信息失败');
            });
        }
        else{
            res.send(JSON.stringify({status : 500,errorMsg : '会话信息已经失效,请重新登录'}));
        }
    });

    //响应登录post请求
    router.post('/login', function(req, res) {
        var email = req.body.email;
        dao.getUserByEmail(email,function(rows){
            if(rows instanceof Array && rows.length > 0){
                if(rows[0]['islive'] === 0){
                    res.send('该账号尚未激活，请激活后登录');
                }
                else{
                    var pass =  rsa.private_key.decrypt(decodeURI(req.body.passWord), 'utf8');
                    var md5 = crypto.createHash("md5");
                    var newPassWord = md5.update(pass).digest("hex");


                    if(rows.length > 0 && rows[0]['pass_word'] === newPassWord){
                        req.session.email = req.body.email;
                        res.send('登陆成功');
                    }
                    else{
                        res.send('用户名或者账号错误');
                    }
                }
            }
            else{
                res.send('该账号尚未注册');
            }
        });

    });

    //响应注册post请求
    router.post('/regNewUser', function(req, res) {
        var sendEmail = function(host,email,code){
            // 创建一个邮件对象
            var mail = {
                // 发件人
                from: 'ipaintgame@126.com',
                // 主题
                subject: 'ipaint激活邮件',
                // 收件人
                to: email,
                // 邮件内容，HTML格式
                text: '点击激活：http://'+(host)+':3000/checkCode?email='+(email)+'&code='+code //接收激活请求的链接
            };
            send(mail);
        };
        var form = new formidable.IncomingForm();
        var tempDir = path.join(__dirname, '../../upload/head/tmp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdir(tempDir);
        }
        form.uploadDir =  tempDir; //文件保存的临时目录为当前项目下的tmp文件夹
        form.maxFieldsSize = 1024 * 1024;  //用户头像大小限制为最大1M
        form.keepExtensions = true;        //使用文件的原扩展名
        form.parse(req, function (err, fields, file) {
            var filePath = '';
            //如果提交文件的form中将上传文件的input名设置为tmpFile，就从tmpFile中取上传文件。否则取for in循环第一个上传的文件。
            if(file.tmpFile){
                filePath = file.tmpFile.path;
            } else {
                for(var key in file){
                    if( file[key].path && filePath==='' ){
                        filePath = file[key].path;
                        break;
                    }
                }
            }
            //文件移动的目录文件夹，不存在时创建目标文件夹
            var targetDir = path.join(__dirname, '../../upload/head');
            if (!fs.existsSync(targetDir)) {
                fs.mkdir(targetDir);
            }
            var fileExt = filePath.substring(filePath.lastIndexOf('.'));
            var regUser = function(userData,cb){
                var md5 = crypto.createHash("md5");
                var newPassWord = md5.update(userData['password']).digest("hex");
                var postData = {
                    email : userData['email'],
                    pass_word : newPassWord,
                    user_name : userData['userName'],
                    sex : userData['sex'] ? userData['sex'] : '男',
                    head_url : userData['imgUrl'],
                    code : userData['code']
                };
                dao.addUser(postData,cb);
            };
            var pass = rsa.private_key.decrypt(fields.password, 'utf8');
            var userData = {
                email : fields.email,
                password : pass,
                userName : fields.userName,
                code : (new Date().getTime()).toString()
            };
            //判断是否有上传文件
            if(filePath.lastIndexOf('.') > -1){
                //判断文件类型是否允许上传
                if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
                    var err = new Error('此文件类型不允许上传');
                    res.json({code:-1, message:'此文件类型不允许上传'});
                } else {
                    //以当前时间戳对上传文件进行重命名
                    var fileName = new Date().getTime() + fileExt;
                    var targetFile = path.join(targetDir, fileName);
                    userData['imgUrl'] = fileName;
                    //移动文件
                    fs.rename(filePath, targetFile, function (err) {
                        if (err) {
                            console.info(err);
                            res.json({code:-1, message:'操作失败'});
                        } else {
                            regUser(userData,function(result){
                                sendEmail(req.hostname,userData.email,userData.code);
                                res.render('tips',{userName : userData.userName,tipsText : '激活链接已经发送至您的邮箱，请查收并且激活'});
                            });
                        }
                    });
                }
            }
            else{
                userData['imgUrl'] = 'defaultGirl.jpg';
                regUser(userData,function(result){
                    sendEmail(req.hostname,userData.email,userData.code);
                    res.render('tips',{userName : userData.userName,tipsText : '激活链接已经发送至您的邮箱，请查收并且激活'});
                });
            }
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

module.exports = initNotValidRouter;