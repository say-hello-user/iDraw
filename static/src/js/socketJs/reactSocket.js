var canvas = document.getElementsByTagName('canvas')[0];
var ctx = canvas.getContext('2d');
var roomTimer = null;//当前房间的timer
var userTimer = null;//当前用户的timer
var tipsTimer = null;//关键词提示timer
var meTimeData = null;//绘图者是本人时候缓存的绘画信息
var imgArr = [];//该用户本局游戏的图片缓存数组
var curGameUser = null;//保存本局游戏的用户列表
var loadAni = null;//加载效果插件
var preErase = {
	x : 0,
	y : 0,
	w : 0,
	h : 0
};//该对象用于当橡皮擦的时候，清除画布中上次橡皮擦矩形
var _eventHandle = {
	pcMouseDown : function(e){
            e.preventDefault();
			e.stopPropagation();
			 var x = e.offsetX,y = e.offsetY;  //获取目前鼠标位置相对于canvas标签边框的距离
			 _eventHandle.isDown = true; //让此时的down为true，以此判断此时鼠标处于按下状态
			if(this.erase){  //如果为橡皮擦 则模拟一个宽和高都为20大小的橡皮擦
		        var w=20,h=20;

		        if(preErase.x && preErase.y  && preErase.w  && preErase.h ){
		        	var preRect = new Rect(preErase.x,preErase.y,preErase.w,preErase.h);
		            preRect.clearOn(ctx);
		        }

		        var rect = new Rect(x-w/2,y-h/2,w,h);
		        rect.clearOn(ctx);
		        rect.drawRect(ctx);

		        preErase.x = x-w/2 - 2;
		        preErase.y = y-h/2 - 2;
		        preErase.w = w + 4;
		        preErase.h = h + 4;

		        bindEvent._socket.emit('erase',rect.x,rect.y,rect.w,rect.h); //触发橡皮擦事件			        
		        return;
		    }		
		    canvasUtil.clearPos(canvas); //清空当前canvas路径数组
		    canvasUtil.addPos(canvas,x,y);
	},
	pcMouseMove : function(e){
		e.preventDefault();
		e.stopPropagation();
		var w=20,h=20;
		var x = e.offsetX, y = e.offsetY;
		if(_eventHandle.isDown){
			if(!this.erase){
		        canvasUtil.addPos(canvas,x,y);
		        canvasUtil.drawPts(canvas,ctx, this.pts);
		        bindEvent._socket.emit('paint',JSON.stringify({data:new Path(this.pts),status:'ing'}))
	        }
	        else{
	        	if(preErase.x && preErase.y  && preErase.w  && preErase.h ){
		        	var rect = new Rect(preErase.x,preErase.y,preErase.w,preErase.h);
		            rect.clearOn(ctx);
		        }
	        	var rect = new Rect(x-w/2,y-h/2,w,h);
                rect.clearOn(ctx);
                rect.drawRect(ctx);

                preErase.x = x-w/2 - 2;
		        preErase.y = y-h/2 - 2;
		        preErase.w = w + 4;
		        preErase.h = h + 4;

                bindEvent._socket.emit('erase',rect.x,rect.y,rect.w,rect.h);
	        }
		}
	    else{
	    	return;
	    }  
	},
	pcMouseUp : function(e){
        e.preventDefault();
		e.stopPropagation();
		_eventHandle.isDown = false;
		if(this.erase) return;
	    var x = e.offsetX,y = e.offsetY;
	    canvasUtil.addPos(canvas,x,y);
	    canvasUtil.addPath(canvas,this.pts);
	    bindEvent._socket.emit('paint',JSON.stringify({data:new Path(this.pts),status:'end'}));
	    canvasUtil.clearPos(canvas);
	},
	mbTouchStart : function(e){
        e.preventDefault();
		e.stopPropagation();
		var canvasBound = canvas.getBoundingClientRect();
		var touchPos = e.targetTouches[0];
	    var x = touchPos.clientX - canvasBound.left,y = touchPos.clientY - canvasBound.top;
	    _eventHandle.isDown = true;
	    if(this.erase){
	        var w=20,h=20;
	        if(preErase.x && preErase.y  && preErase.w  && preErase.h ){
	        	var preRect = new Rect(preErase.x,preErase.y,preErase.w,preErase.h);
	            preRect.clearOn(ctx);
	        }
	        var rect = new Rect(x-w/2,y-h/2,w,h);
	        rect.clearOn(ctx);
	        rect.drawRect(ctx);

	        preErase.x = x-w/2 - 2;
	        preErase.y = y-h/2 - 2;
	        preErase.w = w + 4;
	        preErase.h = h + 4;

	        bindEvent._socket.emit('erase',rect.x,rect.y,rect.w,rect.h);				        
	        return;
	    }	
	    canvasUtil.clearPos(canvas);
	    canvasUtil.addPos(canvas,x,y);
	},
	mbTouchMove : function(e){
		e.preventDefault();
		e.stopPropagation();
		var canvasBound = canvas.getBoundingClientRect();
		var touchPos = e.targetTouches[0];
		var w=20,h=20;
	    var x = touchPos.clientX - canvasBound.left, y = touchPos.clientY - canvasBound.top;
		if(_eventHandle.isDown){						
	        if(!this.erase){
		        canvasUtil.addPos(canvas,x,y);
		        canvasUtil.drawPts(canvas,ctx, this.pts);
		        bindEvent._socket.emit('paint',JSON.stringify({data:new Path(this.pts),status:'ing'}))
	        }
	        else{
	        	if(preErase.x && preErase.y  && preErase.w  && preErase.h ){
		        	var rect = new Rect(preErase.x,preErase.y,preErase.w,preErase.h);
		            rect.clearOn(ctx);
		        }

	        	var rect = new Rect(x-w/2,y-h/2,w,h);
	            rect.clearOn(ctx);
	            rect.drawRect(ctx);

	            preErase.x = x-w/2 - 2;
		        preErase.y = y-h/2 - 2;
		        preErase.w = w + 4;
		        preErase.h = h + 4;

	            bindEvent._socket.emit('erase',rect.x,rect.y,rect.w,rect.h);
	        }
		}
	    else{
	    	return;
	    }  
	},
	mbTouchEnd : function(e){
		e.preventDefault();
		e.stopPropagation();
		_eventHandle.isDown = false;
		if(this.erase) return;
	    bindEvent._socket.emit('paint',JSON.stringify({data:new Path(this.pts),status:'end'}));
	    canvasUtil.clearPos(canvas);
	},
    isDown : false//判断绘图时鼠标是否放下
};
//绑定canvas相关的响应服务端socket事件的方法
var bindEvent = {
	 bindCanvasEvent : function(socket){
            bindEvent._socket = socket;
	 		if(util.isPc()){
	 			canvas.addEventListener('mousedown',_eventHandle.pcMouseDown);
				canvas.addEventListener('mousemove',_eventHandle.pcMouseMove);
				canvas.addEventListener('mouseup',_eventHandle.pcMouseUp);
	 		}
 			else{
 				canvas.addEventListener('touchstart',_eventHandle.mbTouchStart);
				canvas.addEventListener('touchmove',_eventHandle.mbTouchMove);
				canvas.addEventListener('touchend',_eventHandle.mbTouchEnd);
 			}
	 },
	 removeCanvasEvent : function(){
	 	if(util.isPc()){
            canvas.removeEventListener('mousedown',_eventHandle.pcMouseDown);
			canvas.removeEventListener('mousemove',_eventHandle.pcMouseMove);
			canvas.removeEventListener('mouseup',_eventHandle.pcMouseUp);
	 	}
	 	else{
            canvas.removeEventListener('touchstart',_eventHandle.mbTouchStart);
			canvas.removeEventListener('touchmove',_eventHandle.mbTouchMove);
			canvas.removeEventListener('touchend',_eventHandle.mbTouchEnd);
	 	}
	 },
    socket : null
};
//绑定响应服务端socket事件的其他dom相关响应
var reactEvent = {
	updateUserList : function(userListArr){
		if((userListArr instanceof Array) && userListArr.length > 0){
			var userList = dom.queryAll('.userBottom'),i,l;
			for(i = 0,l = userList.length;i < l;i++){
				userList[i].innerHTML = '';
                userList[i].previousSibling.removeAttribute('style');
                dom.closest(userList[i],'.user').removeAttribute('style');
			}
			for(i = 0,l = userListArr.length;i < l;i++){
				var temp = userList[i],dataTmp = userListArr[i];
                temp.innerHTML = '<span class = "userName">'+dataTmp['userName']+'</span>'
                     + '<span class = "readyText">'+(dataTmp['isReady'] ? '准备' : '未准备')+'</span>' +
					(dataTmp['email'] === cache.get('email') ? '' : '<i class="iconfont icon-tianjiahaoyou1 add-friend" data-friend-email = "'+(dataTmp['email'])+'"></i>');
                temp.previousSibling.style.color = 'rgb(0,170,251)';
				dom.closest(temp,'.user').style.borderColor = 'rgb(0,170,251)';
			}
		}
        curGameUser = userListArr;
	},//更新当前房间用户列表
	updateReady : function(type,userName,curSocket){
	 	 var userList = dom.queryAll('.userBottom');
		 for(var i = 0,l = userList.length;i < l;i++){
		 	 var nameDom = dom.query('.userName',userList[i]);
			 if(nameDom && (nameDom.innerText === userName)){
			 	var readyTextDom = dom.query('.readyText',userList[i]);
			 	readyTextDom.innerText = (type === 'ready' ? '准备' :'未准备');
			 }
		 }
		 //如果取消准备则取消当前房间内所有计时器
		 if(type === 'cancleReady'){
             reactEvent.stopAll(curSocket);
		 }
	},//更新当前房间用户准备状态
	isMeTime : function(curSocket,data){
		bindEvent.bindCanvasEvent(curSocket);  //注册canvas的绘图事件
        pDom.sendInput.setAttribute('disabled',true);//设置当前作画者的输入框为禁止输入状态
		pDom.keyWord.innerText = '关键字:'+data.keyWord;
        meTimeData = data;
		dom.show(pDom.drawUtil);
	},//游戏回合轮到我的时候执行方法
	notMeTime : function(curSocket){
          dom.hide(pDom.drawUtil);
          bindEvent.removeCanvasEvent(curSocket);  //取消canvas的绘图事件
          pDom.sendInput.removeAttribute('disabled');
	},//当前回合为本人时候，结束当前回合触发的方法
    gameStart : function(curSocket,curUserName){
        var time = document.createElement('h1');
        time.classList.add('time');
        document.body.appendChild(time);
        dom.show(pDom.back);
        util.isPc() && (pDom.msgList.innerHTML = '');//清空对话列表
		paintCom.initGameList();
        roomTimer = util.countDown('/src/js/timerJs/startTimer.js',startCb,stopCb);
        roomTimer.startWorker();
        imgArr = [];//初始化当前回合绘画图片数组
        function startCb(event){
            time.innerHTML= "游戏开始还有"+event.data+"秒钟";
            if(event.data == 0){
                roomTimer.stopWorker();
                dom.hide(pDom.back);
                util.isPc() && pDom.msgList.appendChild(dom.createByHTML('<p>***回合开始***</p>'));
                reactComFun.show();
                if(curUserName == cache.get('userName')){  //如果当前开始的第一个用户为自己 则触发firstGamer事件
                    curSocket.emit('firstGamer',null);
                }
            }
        }
        function stopCb(){
           dom.queryAll('.time').length > 0  && document.body.removeChild(time);
        }
    },//游戏开始时触发的方法
    gameRestart : function(){
        pDom.sendInput.removeAttribute('disabled');
        reactComFun.hide();
	},//游戏重新开始时触发的方法
	gameEnd : function(curSocket){
        bindEvent.removeCanvasEvent(curSocket);  //取消canvas的绘图事件
        curSocket.emit('gameEnd',null);
        reactComFun.hide();
        var gameUserList = [];
        var gameUserChilds = pDom.gameUser.children;
        for(var i = 0,l = gameUserChilds.length;i < l;i++){
        	var temp = gameUserChilds[i];
        	var userDom = dom.query('[data-user-name]',temp);
            gameUserList.push({
				headUrl : './head/' + dom.query('.avator',temp).dataset.head,
				userName : userDom.dataset.userName,
				email : temp.dataset.email,
				score : parseInt(userDom.childNodes[0].nodeValue)
			})
		}
		//根据score分数进行排序,插入排序
		for(i = 1,l = gameUserList.length;i < l;i++){
        	for(var j = i; j > 0;j--){
        		if(gameUserList[j].score > gameUserList[j-1].score){
        			var temp = gameUserList[j-1];
        			gameUserList[j-1] = gameUserList[j];
        			gameUserList[j] = temp;
				}
				else{
        			break;
				}
			}
		}

        var showDrawResult = dom.createByHTML('<div class="game-result animated lightSpeedIn"></div>');
		var closeIcon = dom.createByHTML('<i class="iconfont icon-guanbi1" style="font-size: 20px"></i>');
        closeIcon.addEventListener('click',function(e){
            showDrawResult.classList.remove('lightSpeedIn');
            showDrawResult.classList.add('lightSpeedOut');
        	setTimeout(function(){
                dom.remove(showDrawResult);
			},1000);
		});
        dom.append(showDrawResult,dom.createByHTML('<span>本局游戏结果</span>'));
        dom.append(showDrawResult,closeIcon);
        var span = dom.createByHTML('<h4>恭喜玩家:'+(gameUserList[0].userName)+':获得200金币</h4>');
        dom.append(showDrawResult,span);
        var titleDom = dom.createByHTML('<div>' +
            '<div><span>排名</span></div>' +
            '<div><span>玩家名称</span></div>' +
            '<div><span>本局积分</span></div>' +
            '</div>');
        dom.append(showDrawResult,titleDom);
        for(i = 0,l = gameUserList.length;i < l;i++){
            var temp = gameUserList[i];
            var can = dom.createByHTML('<div>' +
                '<div><span>'+(i+1)+'</span></div>' +
                '<div class="userName"><img src="'+(temp.headUrl)+'" /><span>'+(temp.userName)+'</span></div>' +
                '<div><span>'+(temp.score)+'</span></div>' +
                '</div>');
            dom.append(showDrawResult,can);
        }
        var showCurPaint = dom.createByHTML('<button>显示本局绘图</button>');
        showCurPaint.addEventListener('click',function(){
            var imgHtml = '';
            for(var i = 0,l = imgArr.length;i < l;i++){
                imgHtml += '<img class="page'+(i+1)+'" src="'+(imgArr[i])+'" />'
            }
            if(l < 4){
                var val = 4 - l;
                var j = 0,index = 0;
                while(j < val){
                    j++;
                    if(index >= l){
                        index = 0;
                    }
                    imgHtml += '<img class="page'+(j+l)+'" src="'+(imgArr[index])+'" />';
                    index++;
                }
            }
            var stage = dom.createByHTML('<div class="stage2 animated bounceInDown">' +
                '    <div class="rectContainer" style = "transform:rotateY(0deg);">' +imgHtml+
                '    </div>' +
                '<i class="iconfont icon-iconfontzuo pre"></i>' +
                '<i class="iconfont icon-xiayiyeqianjinchakangengduo-xianxingyuankuang next"></i>' +
                '<i class="iconfont icon-guanbi1 close"></i>' +
                '<h5>本局绘图图片</h5>' +
                '</div>')
            var pre = dom.query('.pre',stage);
            var next = dom.query('.next',stage);
            var close = dom.query('.close',stage);
            var con = dom.query('.rectContainer',stage);
            var preHandle = function(){
                var tranformVal = con.style.transform;
                var curRotate = parseInt(tranformVal.match(/[-]*\d+/)[0]);
                con.style.transform = 'rotateY(' + (curRotate-90) + 'deg)';
            };
            var nextHandle = function(){
                var tranformVal = con.style.transform;
                var curRotate = parseInt(tranformVal.match(/[-]*\d+/)[0]);
                con.style.transform = 'rotateY(' + (curRotate+90) + 'deg)';
            };
            pre.addEventListener('click',preHandle);
            next.addEventListener('click',nextHandle);
            close.addEventListener('click',function(){
                    stage.classList.remove('bounceInDown');
                    stage.classList.add('bounceOutDown');
                    setTimeout(function(){
                        pre.removeEventListener('click',preHandle);
                        next.removeEventListener('click',nextHandle);
                        dom.remove(stage);
                    },1000);
            });

            dom.append(document.body,stage);
        });
        dom.append(showDrawResult,showCurPaint);
        dom.append(pDom.gameCenter,showDrawResult);
        //判断如果第一名是自己,则发送增加金币的请求
        if(gameUserList[0].email === cache.get('email')){
            //更新第一名的金币
            util.ajax({
                url : '/updateUser',
                type : 'post',
                data : {
                    email : gameUserList[0].email,
                    updateData: JSON.stringify({
                        gold_num : 200
                    })
                },
                success : function(data){
                    var result = JSON.parse(data);
                    if(result.status === 500){
                        new toast({
                            text : result.errorMsg
                        });
                    }
                }
            });
		}
	},//游戏结束时触发的方法
    clearPaint : function(){
        canvasUtil.clearPaint(ctx,canvas);
        dom.hide(pDom.showDraw);
    },//清除当前游戏画布
    curGameData : function(user){
            tipsTimer && tipsTimer.stopWorker();
    	    var paintUser = user.userName,//当前作画者名称
                paintUserEmail = user.email,//当前作画者邮箱
                keyWordSubscr = user.subscribe,//当前关键词提示信息
                myUserName = cache.get('userName'),//我的用户名
                isChange =parseInt(user.isChange);//判断是否为更改关键词
            cache.add('paintUser',paintUser);
            cache.add('paintUserEmail',paintUserEmail);
            cache.add('keyWordSubscr',keyWordSubscr);
            if(user.word && (paintUserEmail === cache.get('email'))){
                pDom.keyWord.innerText = '关键字:'+user.word;
                meTimeData.keyWord = user.word;
            }
            if(util.isPc() && !isChange){
                var p = document.createElement('p');
                p.innerText = '现在由' + paintUser + '作图';
                pDom.msgList.appendChild(p);
			}
			//关键词提示计时器,当前每隔六秒提示一次
            var sendMsg = null;
			tipsTimer = util.countDown('/src/js/timerJs/tipsTimer.js',startCb);
			tipsTimer.startWorker();
			function startCb(event){
                var tips = null;
                var cb = function(){
                    sendMsg = {msg : tips,isRight : 'true'};
                    reactEvent.getMessage(sendMsg);
                    (paintUser !== myUserName)  && (pDom.keyWord.innerText = '提示:' + tips);
                };
                switch (event.data){
                    case 12:
                        tips = keyWordSubscr['wordNum'] + '个字';cb();
                        break;
                    case 6:
                        tips = keyWordSubscr['wordType'];cb();
                        break;
                    case 0:
                        tips = keyWordSubscr['wordTips'];cb();
                        tipsTimer.stopWorker();
                        break;
                }
			}
			if(!isChange){
                //添加当前作画者提示画笔
                var curPaintUserDom = dom.queryAll('[data-user-name]',pDom.gameUser);
                dom.remove(dom.query('.drawIcon'),pDom.gameUser);
                for(var i = 0,l = curPaintUserDom.length;i < l;i++){
                    if(curPaintUserDom[i].dataset.userName === paintUser){
                        var par = curPaintUserDom[i].parentElement;
                        var drawIcon = dom.createByHTML('<i class="iconfont icon-qianbipencil82 drawIcon"></i>');
                        dom.append(par,drawIcon);
                    }
                }
            }
	},//当前局回合游戏数据
    stopAll : function(curSocket){
        pDom.leftTime.innerText = '';
        bindEvent.removeCanvasEvent(curSocket);  //取消canvas的绘图事件
        roomTimer && roomTimer.stopWorker();
        userTimer && userTimer.stopWorker();
        tipsTimer && tipsTimer.stopWorker();
	},//停止当前回合房间内所有计时器
    showAnswer : function(curSocket,answer){
    	//显示答案的时候停止提示与游戏时间的倒计时,防止之前的倒计时影响最新的一局
        userTimer && userTimer.stopWorker();
        tipsTimer && tipsTimer.stopWorker();
        cache.add('keyWord',answer);
        paintCom.initShowImgTime();
        pDom.keyWord.innerText = '暂无提示';
    	var div = document.createElement('div');
    	var result = document.createElement('h3');
		var img = document.createElement('img');
		div.classList.add('imgContainer');
		if(util.isPc()){
            img.style.width = 300 + 'px';
            img.style.height = 300 + 'px';
		}
		else{
            img.style.width = (document.body.clientWidth - document.body.clientWidth*0.12 - 40)+'px';
            img.style.height = (document.body.clientHeight - document.body.clientHeight*0.4 - 50)+'px';
		}
        canvasUtil.canvasToPng(canvas,imgArr,function(url){
            img.src = url;
        });
        result.innerHTML = "<span style='font-size: 12px;'>答案:</span>"+ "<span style='font-size: 16px;color: red;font-weight: 900;'>" + answer + "</span>";
        div.appendChild(result);
        div.appendChild(img);
        dom.show(pDom.showDraw);
        var hasImg = dom.query('.imgContainer',pDom.showDraw);
        hasImg && dom.remove(hasImg);
        pDom.showDraw.appendChild(div);
        paintCom.initGiveProp(curSocket);//初始化赠送道具按钮
	},//显示当前回合游戏答案结果
    getMessage : function(msg){
    	if(msg.isRight === 'true'){
    		cache.add('hasAnswer','true');
		}
    	if(util.isPc() && pDom.userList.classList.contains('hide')){
			 var userMsg = msg.isRight === 'true' ? '系统提示:'+msg.msg : msg.userName + '说:'+ msg.msg;
			 pDom.msgList.appendChild(dom.createByHTML('<p>'+(userMsg)+'</p>'));
			 pDom.msgList.scrollTop = pDom.msgList.scrollHeight;
		}
		else{
            var showMsgDom = dom.createByHTML('<span class="msg"></span>'),timer;
            var msgPosBottom = (Math.floor(Math.random()*135) + 35) + 'px;';
            var msgColor = util.randomColor();
            showMsgDom.style.cssText = 'bottom:'+msgPosBottom + 'color:' + msgColor;
            showMsgDom.innerText = msg.isRight === 'true' ? '系统提示:'+msg.msg : msg.userName + '说:'+ msg.msg;
            dom.append(document.body,showMsgDom);
            var leftVal = -showMsgDom.offsetWidth;
            var clearPos = document.body.clientWidth + showMsgDom.offsetWidth;
            showMsgDom.style.right = leftVal + 'px';
            showMsgDom.classList.add('opacity1');
            timer = setInterval(function(){
                leftVal = leftVal + 2;
                showMsgDom.style.right = leftVal + 'px';
                if(leftVal > clearPos){
                    clearInterval(timer);
                    document.body.contains(showMsgDom) && document.body.removeChild(showMsgDom);
                }
            },10);
		}
	},//聊天室获取信息接口
    updateScore : function(data){
			var userScoreDoms = dom.queryAll('[data-user-name]',pDom.gameUser),
                userScore = data.roomScore;
			for(var i = 0,domLen = userScoreDoms.length;i < domLen;i++){
				for(var j = 0,userLen = userScore.length;j < userLen;j++){
					var curUserName = userScoreDoms[i].dataset.userName;
					if(curUserName === userScore[j].userName){
                        userScoreDoms[i].innerHTML = '';
                        userScoreDoms[i].innerText = userScore[j].score;
                        if(curUserName === data.changeUser || cache.get('paintUser') === userScore[j].userName){
                            var addScore = (curUserName === data.changeUser ? '+5分' : '+8分'),
                                tipsDiv = dom.createByHTML('<div class="tips"></div>');
                            tipsDiv.innerText = addScore;
                            dom.append(userScoreDoms[i],tipsDiv);
                            tipsDiv.classList.add('animated','fadeInDown');
						}
					}
				}
			}
	},//更新当前房间内用户分数
    userAllAnswerRight : function(curSocket){
       paintCom.emitNextUser(curSocket);
	},//用户全部回答正确之后触发的接口
    startTimer : function(curSocket,data){
        function userTimerStartCb(event){
            pDom.leftTime.innerText = event.data.timeLeft;
            if(event.data.timeLeft === 0){
                pDom.leftTime.innerText = '';
                userTimer.stopWorker();
				(data.curPaint === cache.get('email')) && paintCom.emitNextUser(curSocket);
            }
        }
        reactComFun.startGameTimer(userTimerStartCb);
	},//开启游戏当前回合定时器
    setAnswerImgId : function(data){
    	var img = dom.query('img',dom.query('.imgContainer',pDom.showDraw));
        img && (img.dataset.id = data);
        loadAni && loadAni.hide();
	},//设置当前回合绘图者图片id
    showProp : function(data){
    	var animateData = JSON.parse(data);
		paintCom.animate(animateData.iconClass,animateData.iconAnimateClass);
	},//显示当前游戏最终结果
    addTime : function(){
        userTimer.getWorker().postMessage(50);
        new toast({text : '作画者使用加时卡，增加作画间50秒'});
	},
    changeWord : function(){
        new toast({text : '作画者使用换词卡，关键词更换'});
    }
};

var paintCom = {
    initGameList : function(){
        pDom.gameUser.innerHTML = '';
        var emailArr = [];
        for(var i = 0,l = curGameUser.length;i < l;i++){
            var userDiv = document.createElement('div');
            userDiv.classList.add('userDiv');
            userDiv.dataset.email = curGameUser[i].email;
            var avator = document.createElement('div');
            avator.classList.add('avator');
            avator.style.backgroundImage = 'url(./img/head/loadingHead.jpg)';
            var userName = document.createElement('p');
            userName.innerText = curGameUser[i].userName;
            var score = document.createElement('p');
            score.innerText = '0';
            score.dataset.userName = curGameUser[i].userName;
            userDiv.appendChild(avator);
            userDiv.appendChild(userName);
            userDiv.appendChild(score);
            pDom.gameUser.appendChild(userDiv);
            emailArr.push(curGameUser[i].email);
        }
        util.ajax({
            url : '/getRoomUsersData',
            type : 'post',
            data : {
                emailArr : emailArr
            },
            success : function(data){
                var result = JSON.parse(data);
                if(result.status === 200){
                    var userArr = result.data;
                    var gameUserChilds = pDom.gameUser.children;
                    for(var i = 0,l1 = userArr.length;i < l1;i++){
                        for(var j = 0,l2 = gameUserChilds.length;j < l2;j++){
                            if(gameUserChilds[j].dataset.email === userArr[i]['email']){
                                var temp = dom.query('.avator',gameUserChilds[j]);
                                temp.dataset.head = userArr[i]['head_url'];
                                temp.style.backgroundImage = 'url(./head/'+(userArr[i]['head_url'])+')';
                            }
                        }
                    }
                }
                else if(result.status === 404){
                    new toast({text : '房间用户头像信息为空'});
                }
                else{
                    new toast({text : result.errorMs});
                }
            }
        });
    },//初始化当前游戏开始之后玩家用户左侧列表
    initShowImgTime : function(){
        var hasTime = dom.query('.showDrawTime',pDom.showDraw);
        hasTime && dom.remove(hasTime);
        var remainTime = dom.createByHTML('<p class="showDrawTime">倒计时:10</p>'),time = 10;
        dom.append(pDom.showDraw,remainTime);
        var timer = setInterval(function(){
            if(time === 0){
                clearInterval(timer);
            }
            else{
                time--;
                remainTime.innerText = '倒计时:' + time;
            }
        },1000);
    },//显示当前回合结束之后显示答案的时间倒计时
    initGiveProp : function(curSocket){ //初始化该用户在每小回合结束之后显示答案界面的赠送道具按钮
        var btnCon = dom.query('.btnCon',pDom.showDraw);
        btnCon && dom.remove(btnCon);
        //如果当前绘画者是自己则不初始化赠送道具的按钮列表
        if(cache.get('paintUserEmail') === cache.get('email')){
            return false;
        }
        util.ajax({
            url : '/getUserPackGoods',
            type : 'get',
            success : function(data){
                var result = JSON.parse(data);
                if(result.status === 200 || result.status === 404){
                    var goodsArr = result.data;
                    var btnList = [{btn : null,data : {num : 0,goodsId : 4},iconClass : 'icon-zuichun',iconAnimate:'iconMeMeDaAnimate'},
                        {btn : null,data : {num : 0,goodsId : 6},iconClass : 'icon-tangguo',iconAnimate:'iconCandyAnimate'},
                        {btn : null,data : {num : 0,goodsId : 5},iconClass : 'icon-fanqie',iconAnimate:'iconTomatoAnimate'},
                        {btn : null,data : {num : 0,goodsId : 1},iconClass : 'icon-dianzan1',iconAnimate:'iconZanAnimate'}];

                    for(var i = 0,l = goodsArr.length;i < l;i++){
                        var cache1 = goodsArr[i];
                        for(var j = 0,l2 = btnList.length;j < l2;j++){
                            var cache2 = btnList[j].data;
                            if(cache1['goods_id'] === cache2['goodsId']){
                                cache2['num'] = cache1['goods_num'];
                            }
                        }
                    }

                    var btnContainer = dom.createByHTML('<div class="btnCon"></div>');
                    for(i = 0,l = btnList.length;i < l;i++){
                        var temp = btnList[i],data = temp.data;
                        var btn = dom.createByHTML('<div data-id = "'+(data.goodsId)+'"><i class="iconfont '+(temp.iconClass)+'"></i><span>'+(data.num)+'</span></div>');
                        temp.btn = btn;
                        dom.append(btnContainer,btn);
                        if(data.num === 0){
                            dom.query('i',temp.btn).classList.add('notHave');
                            dom.query('span',temp.btn).classList.add('notHave');
                        }
                    }
                    dom.append(pDom.showDraw,btnContainer);

                    btnContainer.addEventListener('click',function(e){
                        var target = e.target;
                        if(target === this){
                            return false;
                        }

                        var dataIdDom = dom.closest(target,'[data-id]'),
                            goodNum = parseInt(dom.query('span',dataIdDom).innerText);
                        if(dom.query('.wait',dataIdDom)){
                            return false;
                        }
                        paintCom.addWait(dataIdDom);
                        if(goodNum === 0){
                            new toast({text : '道具数量不足，无法赠送'});
                            return false;
                        }
                        var goodsId = parseInt(dataIdDom.dataset.id),goodsType = 1;
                        var postJson = {reduceGoodsId : goodsId,paint_user_email : cache.get('paintUserEmail')};
                        if(goodsId === 5){
                            goodsType =  0;
                        }
                        goodsType ? (postJson['give_charm_num'] = 1) : (postJson['give_slots_num'] = 1);
                        var iconClass = null,iconAnimateClass = null;
                        for(var i = 0,l = btnList.length;i < l;i++){
                            var temp = btnList[i];
                            if(temp.btn === dataIdDom){
                                iconClass = temp.iconClass;
                                iconAnimateClass = temp.iconAnimate;
                                break;
                            }
                        }
                        //点赞道具
                        if(goodsId === 1){
                            var img = dom.query('img',dom.query('.imgContainer',pDom.showDraw));
                            var imgId = img.dataset.id;
                            //如果此时获取到了imgID则点赞卡可以使用
                            if(imgId){
                                //点赞卡使用则更新用户背包请求
                                util.ajax({
                                    url : '/reduceUserGoods',
                                    type : 'post',
                                    data : {
                                        goodsId : 1
                                    },
                                    success : function(data){
                                        var result = JSON.parse(data);
                                        if(result.status === 200){
                                            var span = dom.query('span',dataIdDom);
                                            if((goodNum - 1) === 0){
                                                dom.query('i',dataIdDom).classList.add('notHave');
                                                span.classList.add('notHave');
                                                span.innerText = 0;
                                            }
                                            else{
                                                span.innerText = parseInt(span.innerText) - 1;
                                            }
                                            curSocket.emit('userGiveProp',JSON.stringify({iconClass:iconClass,iconAnimateClass:iconAnimateClass}));
                                        }
                                        else{
                                            new toast({text : result.errorMsg});
                                        }
                                    }
                                });
                                //更新当前图片的点赞信息
                                util.ajax({
                                    url : '/updateImgData',
                                    type : 'post',
                                    data : {
                                        imgId : imgId
                                    },
                                    success : function(data){
                                        var result = JSON.parse(data);
                                        if(result.status !== 200){
                                            new toast({text : '绘图图片上传失败'});
                                        }
                                    }
                                });
                            }
                        }
                        //其它道具
                        else{
                            util.ajax({
                                url : '/addMatchData',
                                type : 'post',
                                data : postJson,
                                success : function(data){
                                    var result = JSON.parse(data);
                                    if(result.status === 200){
                                        var span = dom.query('span',dataIdDom);
                                        if((goodNum - 1) === 0){
                                            dom.query('i',dataIdDom).classList.add('notHave');
                                            span.classList.add('notHave');
                                            span.innerText = 0;
                                        }
                                        else{
                                            span.innerText = parseInt(span.innerText) - 1;
                                        }
                                        curSocket.emit('userGiveProp',JSON.stringify({iconClass:iconClass,iconAnimateClass:iconAnimateClass}));
                                    }
                                    else{
                                        new toast({text : result.errorMsg});
                                    }
                                }
                            });
                        }
                    });
                }
                else if(result.status === 500){
                    new toast({text : result.errorMsg});
                }
            }
        });
    },//初始化显示答案页面道具赠送栏按钮
    uploadPaintImg : function(curSocket,url){
        var imgBlob = util.dataURLtoBlob(url);
        var formData  = new FormData();
        formData.append("imgBlob",imgBlob);
        loadAni ? loadAni.show() : (loadAni = new loadAnimate(pDom.showDraw));
        util.ajax({
            url : '/uploadPaintImg',
            type : 'post',
            async:false,
            data : formData,
            contentType : true,
            success : function(data){
                curSocket.emit('getCurImgId',data);
            }
        });
    },//上传当前回合作画者作画图片
    emitNextUser : function(curSocket){
        curSocket.emit('showAnswer',meTimeData.keyWord);//显示答案
        canvasUtil.canvasToPng(canvas,null,function(url){
            paintCom.uploadPaintImg(curSocket,url);//上传本回合绘图图片
        });
        setTimeout(function(){
            dom.hide(pDom.showDraw);
            cache.remove('keyWord')
            pDom.sendInput.removeAttribute('disabled');
            curSocket.emit('nextUser',meTimeData.curNum);
        },10000);
    },//触发房间内下一个用户作画
    animate : function(iconClass,iconAnimateClass){
        var iconAnimate = document.createElement('div');
        iconAnimate.classList.add(iconAnimateClass);
        var icon = document.createElement('i');
        icon.classList.add('iconfont',iconClass);
        dom.append(iconAnimate,icon);
        dom.append(document.body,iconAnimate);
        iconAnimate.addEventListener('animationend',function(){
            dom.remove(iconAnimate);
        });
    },//道具赠送动画效果
    addWait : function(par){
        var waitDom = dom.createByHTML('<div class="wait" data-time = "3"><p>3</p></div>');
        dom.append(par,waitDom);
        var inter = setInterval(function(){
            var num = parseInt(waitDom.dataset.time);
            if(num === 0){
                clearInterval(inter);
                dom.remove(waitDom);
            }
            waitDom.innerHTML = '<p>' + (num - 1) + '</p>';
            waitDom.dataset.time = num - 1;
        },1000);
    }
};

var reactComFun = {
    show : function(){
        dom.show(pDom.paintMain);
        dom.hide(pDom.userList);
        dom.hide(pDom.ready);
        dom.hide(pDom.lock);
        dom.hide(pDom.sendInvate);
        pDom.keyWord.innerText = '暂无提示';
        pDom.leftTime.innerText = '';
        document.body.addEventListener('touchmove',reactComFun.mbPreventDefault);
    },
    hide : function(){
        dom.hide(pDom.paintMain);
        dom.show(pDom.userList);
        dom.show(pDom.ready);
        dom.hide(pDom.showDraw);
        dom.hide(pDom.drawUtil);
        pDom.lock.classList.remove('hide');
        pDom.sendInvate.classList.remove('hide');
        pDom.readyText.innerText = '准备';
        document.body.removeEventListener('touchmove',reactComFun.mbPreventDefault)
    },
    mbPreventDefault : function(e){
        e && e.preventDefault();
    },
    startGameTimer : function(startCb,stopCb){
        var defaultStopCb = function(){};
        userTimer = util.countDown('/src/js/timerJs/gameTimer.js',startCb,stopCb ? stopCb : defaultStopCb);
        userTimer.startWorker();
    }
};



