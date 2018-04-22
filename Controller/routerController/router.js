var express = require('express');
var postRouter = require('./postRouter');
var getRouter = require('./getRouter');
var initNotValidRouter = require('./notValidRouter');

var validRouter = express.Router();
var notValidRouter = express.Router();


notValidRouter.use(function(req, res, next) {
    next();
});

// 使用中间件用来拦截未登录的用户
validRouter.use(function(req, res, next) {
    if(!req.session.email && req.path !== '/'){ //如果用户没用登陆则跳转到登陆界面
        res.send(JSON.stringify({status : 500,errorMsg : '会话已过期,请重新登录'}));
     /*  var notValid = ['/login','/loginPage','/registerPage','/regNewUser','/getUserDataByEmail','/checkCode'];//不需要拦截的请求路径
        if(notValid.indexOf(req.path) === -1){//判断如果请求路径有在notValid数组中,则不拦截
            res.redirect('/loginPage');
        }else{
            next();
        }*/
    }
    else{
      next();
    }
});

initNotValidRouter(notValidRouter);
postRouter(validRouter); //加载post请求监听模块
getRouter(validRouter); //加载get请求监听模块

module.exports = {
    validRouter : validRouter,
    notValidRouter : notValidRouter
};