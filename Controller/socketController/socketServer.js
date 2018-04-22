var redisUtil = require('../../Util/redisUtil')(); //缓存模块
var util = require('../..//Util/socketUtil'); //socket操作公共方法模块
var dao = require('../dataController/dao');

function socketServer(redis){
    redisUtil.initRedis(redis);

	var init = function(io,serverNum){
		console.log('初始化'+serverNum);
		var ioNsp = io.of('/' + (serverNum ? serverNum : 'server1')); //判断选择的服务器大区，默认为server1
        ioNsp.use(function(socket, next){
            if (socket.request.headers.cookie) return next();
              next(new Error('会话已过期,请重新登陆'));
        });
		//监听客户端连接
		ioNsp.on('connection', function (socket) {
		    //监听客户端加入房间事件
		  socket.on('joinRoom', function (data) {
		  	      var user = JSON.parse(data);
                  util.setCurSocketData(this,{
					  userName : user.userName,
                      roomId : user.roomId,
					  email : user.email,
                      isReady : user.isReady,
					  score : 0,
					  answerRight : 0
				  });
				  var socketData = util.getCurSocketData(this);
                  this.join(socketData.roomId);//当前socket添加进房间
                  var roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId),
                      currentRoomUser = [];

				  if(roomSockets){
					  for(var i=0,l=roomSockets.length;i<l;i++){
						  currentRoomUser.push({"userName" : roomSockets[i].userName,email : roomSockets[i].email,"isReady" : roomSockets[i].isReady});
					  }
					  ioNsp.in(socketData.roomId).emit('newUserAddRoom',currentRoomUser);
				  }

				  redisUtil.getByKey('roomUser').then(function(roomUser){
					  if(!roomUser[socketData.nsp][socketData.roomId]){
						  roomUser[socketData.nsp][socketData.roomId] = [];
					  }
					  roomUser[socketData.nsp][socketData.roomId].push(socketData.userName);
                      redisUtil.addByKey('roomUser',roomUser);
                      redisUtil.getByKey('roomReadyState').then(function(roomReadyState){
                          io.emit('roomMsgChange',JSON.stringify(roomUser),JSON.stringify(roomReadyState));//io命名下 更新当前服务房间信息
					  });
				  });
		  });

		  socket.on('paint',function (data) {
	            data = JSON.parse(data);     
	            var pts = data.data;       
            	switch (data.status){
	                case 'ing' :
	                    socket.broadcast.in(socket.roomId).emit('clientPaint',JSON.stringify(pts));
	                    break;
	                case 'end' :
	                    socket.broadcast.in(socket.roomId).emit('clientPaint',JSON.stringify(pts));
	                    pts.tag = 'pts';
	                   // paths.push(pts);	                
	                    break;
                }      
	        });

		  socket.on('erase',function (x,y,w,h) {
	           // paths.push({tag:'erase',x:x,y:y,w:w,h:h});
	            socket.broadcast.in(socket.roomId).emit('erase',x,y,w,h);
		     });

		  socket.on('clearPaint',function () {
              var socketData = util.getCurSocketData(this);
              ioNsp.in(socketData.roomId).emit('clearPaint',null);
          });

		  socket.on('sendInvate',function (data) {
                var socketData = util.getCurSocketData(this);
                var dataJson = JSON.parse(data);
                var toSocket = util.getIoSocketByEmail(io,dataJson.to);
                toSocket && toSocket.emit('getGameInvate',JSON.stringify({from : dataJson.from,roomId : dataJson.roomId,serverName : dataJson.serverName}));
		  });

		  socket.on('ready',function(){
		    	 this.isReady = true;
                 var socketData = util.getCurSocketData(this),
                     roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId),
                     isAllReady = false; //此处判断改房间内是否玩家已经全部准备
		    	 ioNsp.in(socketData.roomId).emit('ready',socketData.userName);
			     //判断当前房间内用户是否大于两个人 而且房间内所有用户都是准备状态 则isALLReady为真表示已经全部准备完毕
		    	 if(roomSockets && roomSockets.length >= 2){
		    	 	 var readyNum = 0;
			   		 for(var i=0,l=roomSockets.length;i<l;i++){
			   		 	 if(roomSockets[i].isReady){
			   		 	 	readyNum ++;
			   		 	 }
			   		 }
			   		 (readyNum === roomSockets.length) && (isAllReady = true);		   		
			   	 }
			   	 if(isAllReady){
                     redisUtil.getByKey('roomReadyState').then(function(roomReadyState){
                         if(!roomReadyState[socketData.nsp][socketData.roomId]){
                             roomReadyState[socketData.nsp][socketData.roomId] = true;
                         }
                         redisUtil.addByKey('roomReadyState',roomReadyState);
                         redisUtil.getByKey('roomUser').then(function(roomUser){
                             io.emit('roomMsgChange',JSON.stringify(roomUser),JSON.stringify(roomReadyState));
                             ioNsp.in(socketData.roomId).emit('gameStart',roomSockets[0].userName);
                         });
                     });
			   	 }
		    });

		  socket.on('addTime',function(){
              var socketData = util.getCurSocketData(this);
              ioNsp.in(socketData.roomId).emit('addTime', null);
          });

		  socket.on('addRoomLock',function(data){
                var socketData = util.getCurSocketData(this);
                var postJson = JSON.parse(data);
                redisUtil.getByKey('roomLockWord').then(function(roomLockWord){
                    roomLockWord[socketData.nsp][postJson.roomId] = postJson.lockVal;
                    redisUtil.addByKey('roomLockWord',roomLockWord);
                    io.emit('lockRoomChange',JSON.stringify(roomLockWord));
                });
          });

		  socket.on('delRoomLock',function(data){
                var socketData = util.getCurSocketData(this);
                var postJson = JSON.parse(data);
                redisUtil.getByKey('roomLockWord').then(function(roomLockWord){
                      delete roomLockWord[socketData.nsp][postJson.roomId];
                      redisUtil.addByKey('roomLockWord',roomLockWord);
                     io.emit('lockRoomChange',JSON.stringify(roomLockWord));
                });
          });

		  socket.on('changeWord',function(){
                var socketData = util.getCurSocketData(this);
                dao.getRandomKeyWord(function(rows){
                    if(rows instanceof Array && rows.length > 0){
                        var temp = rows[0],
                            word = temp['word_detail'] ? temp['word_detail'] : '关键词获取失败',
                            wordNum = temp['word_num'] ? temp['word_num'] : '关键词字数获取失败',
                            wordType = temp['word_type'] ? temp['word_type'] : '关键词类型获取失败',
                            wordTips = temp['word_tips'] ? temp['word_tips'] : '关键词提示获取失败';

                        redisUtil.getByKey('curGameKeyWord').then(function(curGameKeyWord){
                            curGameKeyWord[socketData.nsp][socketData.roomId] = word;
                            redisUtil.addByKey('curGameKeyWord',curGameKeyWord);
                        });
                        ioNsp.in(socketData.roomId).emit('curGameData',JSON.stringify({userName:socketData.userName,email : socketData.email, subscribe:{
                            wordNum : wordNum,
                            wordType : wordType,
                            wordTips : wordTips
                        },isChange : 1,word : word}));
                        ioNsp.in(socketData.roomId).emit('changeWord', null);
                    }
                    else{
                        console.log('更换词汇错误');
                    }
                });
          });

		  socket.on('firstGamer',function(){
              var socketData = util.getCurSocketData(this),
                   roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId),
                   firstSocket = roomSockets[0];
              for(var i = 0,l =roomSockets.length;i < l;i++){
                  roomSockets[i].score = 0;
                  roomSockets[i].answerRight = 0;
              }
              dao.getRandomKeyWord(function(rows){
                  if(rows instanceof Array && rows.length > 0){
					  var temp = rows[0],
						  word = temp['word_detail'] ? temp['word_detail'] : '关键词获取失败',
						  wordNum = temp['word_num'] ? temp['word_num'] : '关键词字数获取失败',
						  wordType = temp['word_type'] ? temp['word_type'] : '关键词类型获取失败',
						  wordTips = temp['word_tips'] ? temp['word_tips'] : '关键词提示获取失败';

                      var curData = {
                              keyWord : word,
                              curNum : 0 //当前游戏的用户序号 用作排序当前房间内所有socket数组顺序
                          };
                      redisUtil.getByKey('curGameKeyWord').then(function(curGameKeyWord){
                          curGameKeyWord[socketData.nsp][socketData.roomId] = word;
                          redisUtil.addByKey('curGameKeyWord',curGameKeyWord);
                      });
                      firstSocket.emit('isMeTime',JSON.stringify(curData));
                      ioNsp.in(socketData.roomId).emit('curGameData',JSON.stringify({userName:firstSocket.userName,email : firstSocket.email, subscribe:{
                          wordNum : wordNum,
                          wordType : wordType,
                          wordTips : wordTips
					  },isChange : 0}));//通知当前房间所有用户 当前的作画者状态信息
                      ioNsp.in(socketData.roomId).emit('startTimer', JSON.stringify({curPaint : firstSocket.email}));
				  }
				  else{
                      ioNsp.in(socketData.roomId).emit('curGameData',JSON.stringify({userName:firstSocket.userName,email : firstSocket.email, subscribe:{
                          wordNum : '后台查询关键词错误,请重新开始',
                          wordType : '后台查询关键词错误,请重新开始',
                          wordTips : '后台查询关键词错误,请重新开始'
                      },isChange : 0}));
                  }
              });
		  });

		  socket.on('nextUser',function(curNum){
				var socketData = util.getCurSocketData(this),
					roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId);
				socket.emit('notMeTime',null);
				ioNsp.in(socketData.roomId).emit('clearPaint',null);
			    for(var i = 0,l =roomSockets.length;i < l;i++){
					  roomSockets[i].answerRight = 0;
				}

				var nextSocket = roomSockets[parseInt(curNum) + 1];

              dao.getRandomKeyWord(function(rows) {
                  if (rows instanceof Array) {
                      var temp = rows[0],
                          word = temp['word_detail'] ? temp['word_detail'] : '关键词获取失败',
                          wordNum = temp['word_num'] ? temp['word_num'] : '关键词字数获取失败',
                          wordType = temp['word_type'] ? temp['word_type'] : '关键词类型获取失败',
                          wordTips = temp['word_tips'] ? temp['word_tips'] : '关键词提示获取失败';

                      var curData = {
                              keyWord : word,
                              curNum : parseInt(curNum) + 1
                          };
                      redisUtil.getByKey('curGameKeyWord').then(function(curGameKeyWord){
                          curGameKeyWord[socketData.nsp][socketData.roomId] = word;
                          redisUtil.addByKey('curGameKeyWord',curGameKeyWord);
                      });
                      if(nextSocket){
                          ioNsp.in(socketData.roomId).emit('curGameData',JSON.stringify({userName:nextSocket.userName,email : nextSocket.email,subscribe:{
                              wordNum : wordNum,
                              wordType : wordType,
                              wordTips : wordTips
                          },isChange : 0}));
                          nextSocket.emit('isMeTime',JSON.stringify(curData));
                          ioNsp.in(socketData.roomId).emit('startTimer', JSON.stringify({curPaint : nextSocket.email}));
                      }
                      else{
                          ioNsp.in(socketData.roomId).emit('gameEnd',null)
                      }
                  }
              });
		  });

		  socket.on('cancleReady',function(){
				  this.isReady = false;
				  var socketData = util.getCurSocketData(this);
				  ioNsp.in(socketData.roomId).emit('cancleReady',socketData.userName);
			      redisUtil.getByKey('roomReadyState').then(function(roomReadyState){
					  roomReadyState[socketData.nsp][socketData.roomId] && (roomReadyState[socketData.nsp][socketData.roomId] = false);
					  redisUtil.addByKey('roomReadyState',roomReadyState);
				  });
		    });

		  socket.on('gameEnd',function(){
                var socketData = util.getCurSocketData(this);
                var roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId);
                var currentRoomUser = [];
                if(roomSockets){
                    for(var i = 0,l = roomSockets.length;i < l;i++){
                        roomSockets[i].isReady = false;
                        roomSockets[i].score = 0;
                        currentRoomUser.push({"userName" : roomSockets[i].userName,email : roomSockets[i].email,"isReady" : roomSockets[i].isReady});
					}
                    ioNsp.in(socketData.roomId).emit('newUserAddRoom',currentRoomUser);
                    //设置该房间重新开放
                    redisUtil.getByKey('roomReadyState').then(function(roomReadyState){
                        roomReadyState[socketData.nsp][socketData.roomId] = false;
                        redisUtil.addByKey('roomReadyState',roomReadyState);
                        //触发房间信息更新事件
                        redisUtil.getByKey('roomUser').then(function(roomUser){
                            io.emit('roomMsgChange',JSON.stringify(roomUser),JSON.stringify(roomReadyState));
                        });
					});
				}
            });

		  //服务端监听showAnswer事件
		  socket.on('showAnswer',function(data){
              var socketData = util.getCurSocketData(this);
              //通过emit触发在ioNsp命名空间下房间为roomId值的showAnswer事件
              ioNsp.in(socketData.roomId).emit('showAnswer',data);
		  });

		  //服务端监听getCurImgId事件
		  socket.on('getCurImgId',function(data){
			  var socketData = util.getCurSocketData(this);
			  ioNsp.in(socketData.roomId).emit('getCurImgId',data);
		  });

		  //服务端监听赠送道具事件
		  socket.on('userGiveProp',function(data){
                var socketData = util.getCurSocketData(this);
                ioNsp.in(socketData.roomId).emit('userGiveProp',data);
		  });

		  socket.on('message',function(data){
              var socketData = util.getCurSocketData(this);
              var roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId);
              var curMsg = JSON.parse(data);
              var curPaintUser = util.getSocketByEmail(ioNsp,socketData.roomId,curMsg.curUser);//获取当前正在绘图的玩家socket
              redisUtil.getByKey('curGameKeyWord').then(function(curGameKeyWord){
                  var keyWord = curGameKeyWord[socketData.nsp][socketData.roomId];
                  var sendMsg = null;
                  if(curMsg.msg === keyWord){
                  	if(socket.answerRight){
                        sendMsg = {
                            msg : socketData.userName + '已经回答正确,无需再次作答',
                            userName : socketData.userName,
                            isRight : 'true'
                        };
					}
					else{
                        sendMsg = {
                            msg : '恭喜' + socketData.userName + '回答正确',
                            userName : socketData.userName,
                            isRight : 'true'
                        };
                        socket.score = socketData.score + 5;
                        socket.answerRight = 1;//标记当前socket已经回答正确
                        curPaintUser.score = curPaintUser.score + 8;
                        var roomScore = util.getRoomUserScore(ioNsp,socketData.roomId),
							 data = {roomScore : roomScore,changeUser: socketData.userName};
                        ioNsp.in(socketData.roomId).emit('updateScore',JSON.stringify(data));
					}
				  }
				  else{
					  sendMsg = {
                          msg : curMsg.msg,
                          userName : socketData.userName,
                          isRight : 'false'
                      };
				  }
                  ioNsp.in(socketData.roomId).send(JSON.stringify(sendMsg));
				  //判断当前房间是否本局所有用户都已经回答正确，若都回答正确则自动进入下一个用户
				  var rightNum = 0,socketLen = roomSockets.length;

				  for(var i = 0;i < socketLen;i++){
				  	if(roomSockets[i].answerRight){
				  		rightNum++;
					}
				  }
                  //此时正确玩家数等于当前房间所有用户数量-1 所以触发已经全部回答正确事件
				  if(rightNum === socketLen - 1 && socketLen > 1){
                      curPaintUser && curPaintUser.emit('userAllAnswerRight',null);
				  }
              });
		  });

		  socket.on('disconnect',function(){
                var socketData = util.getCurSocketData(this);
	    		socket.leave(socketData.roomId);//离开房间
			    redisUtil.getByKey('roomUser').then(function(roomUser){
				    var index = roomUser[socketData.nsp][socketData.roomId].indexOf(socketData.userName);
					//清除离开该房间的用户
					if(index > -1){
						roomUser[socketData.nsp][socketData.roomId].splice(index,1);
					}
                    redisUtil.addByKey('roomUser',roomUser);
                    redisUtil.getByKey('roomReadyState').then(function(roomReadyState){
                        //当有用户离开房间的时候 更新当前房间内的人数
                        var currentRoomUser = [];
                        var roomSockets = util.getCurRoomSocket(ioNsp,socketData.roomId);
                        if(!roomSockets.length){
                            redisUtil.getByKey('roomLockWord').then(function(roomLockWord){
                                delete roomLockWord[socketData.nsp][socketData.roomId];
                                redisUtil.addByKey('roomLockWord',roomLockWord);
                                io.emit('lockRoomChange',JSON.stringify(roomLockWord));
                            });
                        }
                        if(roomSockets){
                            for(var i=0,l=roomSockets.length;i<l;i++){
                                roomReadyState[socketData.nsp][socketData.roomId] && (roomSockets[i].isReady = false);//如果当前房间已经开始游戏之后有人退出，则重新开始游戏并且设置当前房间内所有socket的准备状态为false
                                currentRoomUser.push({"userName" : roomSockets[i].userName,email : roomSockets[i].email,"isReady" : roomSockets[i].isReady});
                            }
                            ioNsp.in(socketData.roomId).emit('newUserAddRoom',currentRoomUser);
                        }
                        //设置该房间重新开放
                        roomReadyState[socketData.nsp][socketData.roomId] = false;
                        redisUtil.addByKey('roomReadyState',roomReadyState);
                        //触发房间信息更新事件
                        io.emit('roomMsgChange',JSON.stringify(roomUser),JSON.stringify(roomReadyState));
					});
			    });
                ioNsp.in(socketData.roomId).emit('gameRestart',null);//由于有人退出房间，则重新开始本房间游戏
                ioNsp.in(socketData.roomId).emit('clearPaint',null);//清空画布
		    	console.log("namespace disconnect");
		    });

		});

	};
	return{
		init : init
	}
}
exports.socketServer = socketServer;