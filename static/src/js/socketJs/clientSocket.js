function clientSocket(){
	var socket = null;
	var isReady = false;
	var curRoom = null;//当前进入的房间对象
	var initGameSocket = function(room,callBack){
		 curRoom = room;
		 socket = io.connect('/'+cache.get('serverName'));
         socketStatus.init(socket);
		 socket.on("connect", function () {
				 if(!socketStatus.myLoading){
					 socketStatus.myLoading = new loading({text : '房间连接成功'});
				 }
				 else{
					 socketStatus.myLoading.setText('房间连接成功');
				 }
				 socketStatus.myLoading.hide();
		 		var userJson = { "roomId" : room.roomId , "userName" : cache.get('userName'),email : cache.get('email'),isReady : isReady};
			 	socket.emit('joinRoom',JSON.stringify(userJson)); //加入选择的房间号
			    typeof callBack === 'function' && callBack();
		 });
        //监听服务端绘图请求
		 socket.on('clientPaint',function (pts) {
		    pts = JSON.parse(pts);
		    if(!pts) return;
		    canvasUtil.drawPts(canvas,ctx, pts); //调用工具方法进行实时绘图
		});

        //监听服务端橡皮擦请求
		 socket.on('erase',function (x,y,w,h) {
		    new Rect(x,y,w,h).clearOn(ctx);
		});

		 //更新当前房间信息
		 socket.on('newUserAddRoom',function(data){
		 	reactEvent.updateUserList(data);
		 });

		 //准备事件
		 socket.on('ready',function(data){		 	
		    reactEvent.updateReady('ready',data,socket);
		    isReady = true;
		 });

		 //取消准备
	     socket.on('cancleReady',function(data){
	    	reactEvent.updateReady('cancleReady',data,socket);
             isReady = false;
	    });

	     //游戏开始
	     socket.on('gameStart',function(curUserName){
	    	reactEvent.gameStart(socket,curUserName);
	    });

        //当有人退出的时候游戏重新开始
        socket.on('gameRestart',function(data){
            reactEvent.gameRestart();
            reactEvent.stopAll(socket);
        });

        //游戏结束
        socket.on('gameEnd',function(data){
            reactEvent.gameEnd(socket);
        });

        //轮到我作画
	    socket.on('isMeTime',function(data){
	    	reactEvent.isMeTime(socket,JSON.parse(data));
	    });

	    //我的作画时间到
	    socket.on('notMeTime',function(data){
	    	reactEvent.notMeTime(socket);
	    });

	    //清除画布事件
	    socket.on('clearPaint',function(data){
	    	reactEvent.clearPaint();
	    });

        //当前作画者
        socket.on('curGameData',function(data){
            reactEvent.curGameData(JSON.parse(data));
        });

        //监听聊天信息事件
        socket.on('message',function(data){
            reactEvent.getMessage(JSON.parse(data));
        });

        //监听游戏过程中更新当前游戏分数事件
        socket.on('updateScore',function(data){
            reactEvent.updateScore(JSON.parse(data));
		});

        //监听显示当前对局答案事件
        socket.on('showAnswer',function(data){
            reactEvent.showAnswer(socket,data);
        });

        //监听当前对局用户是否已经全部回答正确
        socket.on('userAllAnswerRight',function(){
            reactEvent.userAllAnswerRight(socket);
        });

        //当前游戏回合计时器开始
        socket.on('startTimer',function(data){
            reactEvent.startTimer(socket,JSON.parse(data));
        });

        //获取当前回合imgId
        socket.on('getCurImgId',function(data){
            reactEvent.setAnswerImgId(data);
        });

		//监听道具赠送事件
        socket.on('userGiveProp',function(data){
            reactEvent.showProp(data);
        });

        //监听增加时间作画事件
        socket.on('addTime',function(data){
            reactEvent.addTime();
        });

        //监听更换关键词事件
        socket.on('changeWord',function(data){
            reactEvent.changeWord();
        });

	};
	//关闭当前gameCenter的socket连接
	var closeSocket = function(){
		socket.close();
        socket = null;
        isReady = false;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		curRoom.hasInRoom = false;
		var msgList = dom.queryAll('.msg');
		if(msgList){
            for(var i = 0,l = msgList.length;i < l;i++){
                dom.remove(msgList[i]);
            }
		}
	};
	var getSocket = function(){
		return socket;
    };
	return {
		initGameSocket : initGameSocket,
		closeSocket : closeSocket,
		getSocket : getSocket
	}
}