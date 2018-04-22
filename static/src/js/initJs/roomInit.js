var roomInit = (function(){
    //初始化当前服务器房间状态公用函数
    function roomInit(){
        this.divCache = [];
        this.divContainer = document.createElement('div');//用作缓存每个房间节点
        this.divContainer.classList.add('animated','fadeInRight');
        this.hasInRoom = false;
        this.roomId = null;
        this.serverName = cache.get('serverName');
        pDom.selectRoom.appendChild(this.divContainer);
    }

    roomInit.prototype.getRoomDivs = function(){
        return this.divCache;
    };

    roomInit.prototype.getRoomId = function(){
        return this.roomId;
    };

    roomInit.prototype.loadRoom = function(){
        dom.show(pDom.loading);//显示加载效果
        clientSocket.initGameSocket(this,function(){
            dom.show(pDom.gameCenter);
            dom.hide(pDom.selectRoom);
            setTimeout(function(){
                imgLoaded && dom.hide(pDom.loading);//隐藏加载效果
            },500);
        });
        this.hasInRoom = true;//标记此时已经进入房间
    };

    roomInit.prototype.handle = function(e,roomIndex){
        var self = this;
        if(!this.hasInRoom){
            var roomId = roomIndex ?  roomIndex : dom.closest(e.target,'.roomDiv').dataset.roomId,lockData = lockState[self.serverName][roomId];
            this.roomId = roomId;
            if(roomState){
                if(roomState[this.serverName][roomId]){
                    new toast({text :'该房间已经开始游戏，请您另外选择'});
                    return;
                }
            }
            if(lockState && lockData){
                var inputDom = dom.createByHTML('<div><input type="text" class="modal-input" placeholder="请输入密码" autofocus /></div>');
                var confirmModal = new simpleModal({
                    title : '输入房间密码',
                    btn : [{text : '确认',
                        cb : function(){
                            var passInp = dom.query('input',inputDom);
                            if(lockData === passInp.value){
                                self.loadRoom();
                                confirmModal.destory();
                            }
                            else{
                                new toast({text : '房间密码错误请重新输入'});
                            }
                        }
                    }]
                });
                dom.append(confirmModal.getBody(),inputDom);
            }
            else{
                this.loadRoom();
            }

        }
        else{
            new toast({
                text : '请您先退出该房间，再接受游戏邀请'
            });
        }
    };

    roomInit.prototype.destory = function(){
        if(this.divCache.length > 0){
            this.divContainer.innerHTML = '';
            for(var num = 0,l = this.divCache.length;num < l;num++){
                this.divCache[num].removeEventListener('click',this.handle);
            }
            this.divCache = [];
        }
    };

    roomInit.prototype.init = function(data,callBack){
        this.destory();
        for(var num = 0;num < 20;num++){
            var div = document.createElement('div');
            var i = document.createElement('i');
            var roomIndex =  document.createElement('span');
            var hasUser = false;//用来判断房间是否有人
            this.divCache.push(div);
            roomIndex.innerHTML = "- "+(num + 1)+" -";
            i.classList.add('iconfont','icon-huabi','roomIcon');
            div.classList.add('roomDiv');
            for(var key in data[this.serverName]){
                if(key === 'room' + num){
                    for(var j = 0;j<4;j++){
                        if(data[this.serverName][key][j]){
                            var innerDiv = document.createElement('div');
                            var innerI = document.createElement('i');
                            var innerP = document.createElement('p');
                            innerP.innerHTML = data[this.serverName][key][j];
                            innerP.classList.add('userP');
                            innerI.classList.add('iconfont','icon-touxiang','userIcon','active');
                            innerDiv.classList.add('userIcon'+j);
                            innerDiv.appendChild(innerI);
                            innerDiv.appendChild(innerP);
                            div.appendChild(innerDiv);
                        }
                        else{
                            var innerI = document.createElement('i');
                            innerI.classList.add('iconfont','icon-wenhao3','userIcon'+j);
                            div.appendChild(innerI);
                        }
                    }
                    hasUser = true;
                    (data[this.serverName][key].length > 0) && (i.classList.add('active'));
                }
            }

            if(!hasUser){
                for(var j = 0;j<4;j++){
                    var innerI = document.createElement('i');
                    innerI.classList.add('iconfont','icon-wenhao3','userIcon'+j);
                    div.appendChild(innerI);
                }
            }
            div.appendChild(i);
            var indexCon = dom.createByHTML('<div class="index-con"></div>');
            indexCon.classList.add('roomIndex');
            dom.append(indexCon,roomIndex);
            div.appendChild(indexCon);
            div.dataset.roomId = 'room' + num;
            div.addEventListener('click',this.handle.bind(this));
            this.divContainer.appendChild(div);
        }
        typeof callBack === 'function' && callBack();
    };

    roomInit.prototype.updateLock = function(){
        var roomLockState = lockState[this.serverName];
        for(var i = 0,l = this.divCache.length;i < l;i++){
            var temp = this.divCache[i];
            var indexCon = dom.query('.index-con',temp),
                hasLockIcon = dom.query('i',indexCon);
            if(roomLockState[temp.dataset.roomId] && !hasLockIcon){
                var lockIcon = dom.createByHTML('<i class="iconfont icon-suo" style="color: #f44336;"></i>');
                dom.append(indexCon,lockIcon);
            }
            else if(!roomLockState[temp.dataset.roomId] && hasLockIcon){
                dom.remove(hasLockIcon);
            }
        }
    };

    return roomInit;
})();