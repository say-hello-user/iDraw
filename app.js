var express = require('express');
var bodyParser = require('body-parser'); //解析ajax请求体插件
var path = require('path');
var session = require('express-session'); //session中间件 用来记录登陆用户信息
var RedisStrore = require('connect-redis')(session);//redis缓存数据库 用作缓存
var log4js = require("./Util/log");//日志模块
log4js.configure();

var Redis = require('ioredis');
var redis = new Redis(6379, '127.0.0.1');
var redisUtil = require('./Util/redisUtil')(); //缓存模块
redisUtil.initRedis(redis);

var ejs = require('ejs'); //模板引擎中间件
var router = require('./Controller/routerController/router'); //自定义路由模块
var http = require('http'); //创建http服务模块
var socket = require('socket.io');  //socket模块
var socketServer = require('./Controller/socketController/socketServer').socketServer(redis); //自定义socket监听模块

var app = express();
app.use(log4js.useLog('iPaint'));//日志模块集成到expree中
var server = http.Server(app);
var io = socket(server);

var util = require('./Util/socketUtil'); //socket操作公共方法模块

//需要缓存的两个数据 roomUser当前每个大区房间用户信息 roomReadyState当前每个大区房间状态信息
var cacheJson = [{
	key : 'roomUser',
	value : {
        'server1' : {},
        'server2' : {}
	}},
	{
		key : 'roomReadyState',
		value : {
		'server1' : {},
		'server2' : {}
	}},{
		key : 'curGameKeyWord',
		value : {
			'server1' : {},
			'server2' : {}
	}},{
        key : 'roomLockWord',
        value : {
            'server1' : {},
            'server2' : {}
        }}];

redisUtil.addByKeyArr(cacheJson).then(function(){
    console.log('redis缓存初始化完成');
    socketServer.init(io,'server1');//开启socket1 第一个大区 socket服务
    socketServer.init(io,'server2');//开启socket2 第二个大区 socket服务
});

io.use(function(socket, next){
    if (socket.request.headers.cookie) return next();
    next(new Error('会话已过期,请重新登陆'));
});

io.on('connection', function (socket) {
	 // 获取当前服务器存储的房间在线用户信息
	 //获取当前服务器存储的房间是否开局信息
    redisUtil.getByKey('roomUser').then(function(roomUser){
        redisUtil.getByKey('roomReadyState').then(function(roomReadyState){
            redisUtil.getByKey('roomLockWord').then(function(roomLockWord) {
                socket.on('joinRoom', function (email) {
                    util.setCurSocketData(this,{
                        email : email
                    });
                    this.join(email);//当前socket添加进房间
                });
                socket.emit('roomMsg', JSON.stringify(roomUser), JSON.stringify(roomReadyState),JSON.stringify(roomLockWord)); //将用户信息发送给客户端
                socket.on('disconnect', function () {
                    console.log('io receive disconnect event');
                })
            });
		});
    });
});


server.listen(3000,function(){
	console.log("正在监听3000端口");
});

app.use(session({
				    secret: 'paint',            //服务器端生成session的签名
				    name: 'JSESSIONID',        //这里的name指的是cookie的name，默认cookie的name是：connect.sid
				    cookie: {maxAge: 3600000 },  //设置maxAge是3600000ms，即3600(1小时)s后session和相应的cookie失效过期
				    resave: false,
				    saveUninitialized: true,
	                store : new RedisStrore({
                        "host" : "127.0.0.1",
                        "port" : "6379"
                    })
				}));
app.use(express.static(path.join(__dirname, 'static')));//设置静态文件目录
app.use(express.static(path.join(__dirname, 'upload')));//设置上传的文件静态文件目录
app.use(bodyParser.urlencoded({extended: false}));//使用bodyParser中间件用来解析ajax请求的信息
app.use(bodyParser.json());

app.use('/', router.notValidRouter);//使用自定义路径模块 此模块处理无需登录的请求
app.use('/', router.validRouter);//使用自定义路径模块 此模块处理必须登陆之后才能进行的请求

app.engine('html', ejs.__express);
app.set('view engine', 'html');  // 设置默认的模板引擎
app.set('views', './View');  // 指定模板文件存放位置

app.get('/socket/socket.io.js',function(req,res){//设置获取前台获取socket文件的位置
  res.sendfile('/node_modules/source/socket.io.js');
});


