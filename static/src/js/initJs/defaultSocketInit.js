(function(){
    window.roomState = null;
    window.lockState = null;
    window.room = null;
    window.commonSocketStatus = null;
    //公共socket初始化
    window.socketInit = function(){
        //当未选择房间的时候，首先连接到命名空间为空的socket服务端，用来获取当前房间的状态
        var socket = io.connect();
        room = new roomInit();
        //第一次登陆获取房间状态
        socket.on("roomMsg", function (userSta,roomSta,lockSta) {
            roomSta && (roomState = JSON.parse(roomSta));
            lockSta && (lockState = JSON.parse(lockSta));
            room.init(JSON.parse(userSta),function(){
                setTimeout(function(){
                    imgLoaded && dom.hide(pDom.loading);
                },500);
            });
            room.updateLock();
        });
        //当房间有新用户加入或者离开时候触发，用来更新房间状态
        socket.on("roomMsgChange", function (userSta,roomSta) {
            roomSta && (roomState = JSON.parse(roomSta));
            room.init(JSON.parse(userSta),function(){
                setTimeout(function(){
                    imgLoaded && dom.hide(pDom.loading);
                },500);
            });
            room.updateLock();
        });
        //当房间锁状态改变之后触发
        socket.on("lockRoomChange", function (lockSta) {
            lockSta && (lockState = JSON.parse(lockSta));
            room.updateLock();
        });
        //监听获取游戏请求
        socket.on('getGameInvate',function(data){
            var result = JSON.parse(data);
            var invateModal = new simpleModal({
                title: '游戏邀请',
                body : '<p style="text-align: center;line-height: 80px;">来自'+(result.from)+'的邀请</p>',
                btn : [{
                    text : '接受',
                    cb : function(){
                        if(result.serverName === cache.get('serverName')){
                            var roomId = result.roomId;
                            room.handle(null,roomId);
                        }
                        else{
                            new toast({text : '未在同一服务区，不可进行游戏'});
                        }
                        invateModal.destory();
                    }
                },{
                    text : '拒绝',
                    cb : function(){
                        invateModal.destory();
                    }
                }]
            });
        });
        //监听客户端连接事件
        socket.on("connect", function (data) {
            if(!socketStatus.myLoading){
                socketStatus.myLoading = new loading({text : '连接成功'});
            }
            else{
                socketStatus.myLoading.setText('连接成功');
            }
            socketStatus.myLoading.hide();
            socket.emit('joinRoom',JSON.stringify(cache.get('email'))); //加入选择的房间号
        });

        socketStatus.init(socket);
    }
})();