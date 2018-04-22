function myChat(para){
    this.para = para;
    
    this.backDrop = null;//弹框背景黑暗
    this.container = para.container ? para.container : document.body;//好友dom列表
    this.chatDom = null;//好友dom

    this.mainContainer = [];//子容器数组
    this.tabHeader = null;//tab容器节点

    this._listArr = [];//好友列表数据数组
    this._reqFirArr = [];//好友请求列表数据数组

    this.bindDataReact();//双向绑定数据
    this.loadList(); //初始化加载好友列表
}

myChat.prototype.bindDataReact = function(){
    Object.defineProperty(this, "listArr", {
        enumerable: true,
        configurable: true,
        get : function(){
            return this._listArr;
        },
        set : function(friendList){
            var container = this.mainContainer[0];
            container.innerHTML = '';
            var newListArr = [];
            for(var i = 0,l = friendList.length;i < l;i++){
                var temp = friendList[i];
                newListArr.push({
                    userName : temp['user_name'],
                    headUrl : '/head/' + temp['head_url'],
                    email : temp['email']
                });
            }
            if(newListArr.length > 0){
                var frag =  document.createDocumentFragment();
                for(i = 0,l = newListArr.length;i < l;i++){
                    temp = newListArr[i];
                    var listDom = dom.createByHTML('<div class="list">' +
                        '<img src="'+(temp.headUrl)+'" />' +
                        '<span title="'+(temp.userName)+'">'+(temp.userName)+'</span>' +
                        '<i data-email = '+(temp.email)+' class="iconfont icon-yaoqing" title = "发送游戏邀请" data-type = "invate"></i>' +
                        '<i data-email = '+(temp.email)+' class="iconfont icon-69" title = "删除好友" data-type = "del"></i>' +
                        '</div>');
                    dom.append(frag,listDom);
                }
                dom.append(container,frag);
            }
            else{
                dom.append(container,dom.createByHTML('<span>暂无好友</span>'));
            }
            this._listArr = newListArr;
        }
    });
    Object.defineProperty(this,'reqFirArr',{
        enumerable: true,
        configurable: true,
        get : function(){
            return this._reqFirArr;
        },
        set : function(reqFriList){
            var container = this.mainContainer[1];
            container.innerHTML = '';
            var friList = [];
            for(var i = 0,l = reqFriList.length;i < l;i++){
                var temp = reqFriList[i];
                friList.push({
                    userName : temp['user_name'],
                    headUrl : '/head/' + temp['head_url'],
                    email : temp['email']
                });
            }

            if(friList.length > 0){
                var frag =  document.createDocumentFragment();
                for(i = 0,l = friList.length;i < l;i++){
                    temp = friList[i];
                    var listDom = dom.createByHTML('<div class="list"><img src="'+(temp.headUrl)+'" /><span title="'+(temp.userName)+'">'+(temp.userName)+'</span>' +
                        '<i data-email = '+(temp.email)+' data-type = '+(1)+' title = "同意" class="iconfont icon-iconcorrect"></i>' +
                        '<i data-email = '+(temp.email)+' data-type = '+(0)+' title = "拒绝"  class="iconfont icon-cuowu"></i>' +
                        '</div>');
                    dom.append(frag,listDom);
                }
                dom.append(container,frag);

            }
            else{
                dom.append(container,dom.createByHTML('<span>暂无好友请求</span>'));
            }
            this._reqFirArr = friList;
        }
    });
};

/**
 * 初始化好友组件dom
 */
myChat.prototype.initDom = function(){
    this.backDrop = dom.createByHTML('<div class="modal-backdrop fade in"></div>');
    dom.append(document.body,this.backDrop);
    
    this.chatDom = dom.createByHTML('<div class="chat-container chat-in-animate"></div>');
    var listContainer = dom.createByHTML('<div class="fri-list-container"></div>');
    var friReqContainer = dom.createByHTML('<div class="fri-req-container"></div>');
    var searchFriContainer = dom.createByHTML('<div class="fri-srarch-container">' +
        '<div class="list">' +
        '<input type="text" placeholder="请输入对方游戏名称" /><i class="iconfont icon-chazhao" title="查找" data-type = "search"></i>' +
        '</div>' +
        '</div>');

    this.mainContainer.push(listContainer);
    this.mainContainer.push(friReqContainer);
    this.mainContainer.push(searchFriContainer);

    this.tabHeader = dom.createByHTML('<div class="chat-header">' +
        '<div class="fri-list selected" data-type = "0">好友列表</div>' +
        '<div class="fri-req-list" data-type = "1">好友请求列表</div>' +
        '<div class="fri-search-list" data-type = "2">添加好友</div>' +
        '</div>');

    var listCon = dom.createByHTML('<div class="list-con"></div>');

    dom.append(listCon,listContainer);
    dom.append(listCon,friReqContainer);
    dom.append(listCon,searchFriContainer);

    dom.append(this.chatDom,this.tabHeader);
    dom.append(this.chatDom,listCon);

    dom.append(this.container,this.chatDom);
};

/**
 * 初始化组件所有交互事件
 */
myChat.prototype.initEvent = function(){
    var self = this;
    var removeSel = function(){
        var siblings = this.parentElement.children;
        for(var i = 0,l = siblings.length;i < l;i++){
            siblings[i].classList.remove('selected');
        }
        this.classList.add('selected');
    };
    var setShowTab = function(index){
        if(self.mainContainer[index]){
            for(var i = 0,l = self.mainContainer.length;i < l;i++){
                self.mainContainer[i].removeAttribute('style');
            }
            self.mainContainer[index].style.order = -1;
        }
    };

    /**
     * 背景点击事件
     */
    this.backDrop.addEventListener('click',function(){
        self.hide();
    });

    /**
     * 聊天顶部tab切换事件
     */
    this.tabHeader.addEventListener('click',function (e) {
        var target = e.target;
        var type = parseInt(target.dataset.type);
        switch(type){
            case 0 :
                self.update();
                break;
            case 1 :
                self.loadFriendReq();
                break;
            case 2 :

                break;
        }
        setShowTab(type);
        removeSel.call(target);
    });

    /**
     * 好友列表点击事件 用来判断点击的是否为发送游戏请求的节点
     */
    this.mainContainer[0].addEventListener('click',function(e){
        var target = e.target;
        if(target.tagName === 'I'){
            if(target.dataset.type === 'invate'){
                var curSock = (typeof self.para.curSocket === 'function' && self.para.curSocket.call(this));
                var roomId = (typeof self.para.roomId === 'function' && self.para.roomId.call(this));
                curSock && curSock.emit('sendInvate',JSON.stringify(
                    {
                        from : cache.get('email'),
                        to : target.dataset.email,
                        roomId : roomId,
                        serverName : cache.get('serverName')
                    }));
                new toast({text : '已发送游戏请求'});
            }
            else{
                var email = target.dataset.email;
                util.ajax({
                    url : '/delFriend',
                    type : 'post',
                    data : {
                        friendEmail : email
                    },
                    success : function(data){
                        var result = JSON.parse(data);
                        if(result.status === 200){
                            self.update();
                            new toast({text : '删除好友成功'});
                        }
                        else{
                            new toast({text : result.errorMsg});
                        }
                    }
                });
            }
        }
    });

    /**
     * 好友请求列表点击事件 用来判断点击的是同意或者拒绝的按钮
     */
    this.mainContainer[1].addEventListener('click',function(e){
        var target = e.target;
        if(target.tagName === 'I'){
            //同意
            if(parseInt(target.dataset.type) === 1){
                util.ajax({
                    url : '/agreeFriReq',
                    type : 'post',
                    data : {
                        friendUser : target.dataset.email
                    },
                    success : function(data){
                        var result = JSON.parse(data);
                        if(result.status === 200){
                            self.loadFriendReq();
                            new toast({text : '添加成功'});
                        }
                        else{
                            new toast({text : result.errorMsg});
                        }
                    }
                });
            }
            //拒绝
            else{
                util.ajax({
                    url : '/rejectFriReq',
                    type : 'post',
                    data : {
                        friendUser : target.dataset.email
                    },
                    success : function(data){
                        var result = JSON.parse(data);
                        if(result.status === 200){
                            self.loadFriendReq();
                            new toast({text : '拒绝成功'});
                        }
                        else{
                            new toast({text : result.errorMsg});
                        }
                    }
                });
            }
        }
    });

    /**
     * 好友搜索点击事件
     */
    this.mainContainer[2].addEventListener('click',function(e){
        var target = e.target;
        if(target.tagName === 'I'){
            //判断如果是查找按钮则执行查找逻辑
            if(target.dataset.type === 'search'){
                var inpDom = dom.query('input',target.parentElement),val = inpDom ? inpDom.value : null;
                if(val !== '' && val !== null){
                    self.loadSearchFri(val);
                }
                else{
                    new toast({text : '查找条件不能为空'});
                }
            }
            //否则执行发送添加好友逻辑
            else{
                var friendEmail = target.dataset.friendEmail;
                if(friendEmail !== cache.get('email')){
                    util.ajax({
                        url : '/addFriend',
                        type : 'post',
                        data : {
                            friendEmail : friendEmail
                        },
                        success : function(data){
                            var result = JSON.parse(data);
                            if(result.status === 200){
                                new toast({text : '好友请求已发送'});
                            }
                            else{
                                new toast({text : result.errorMsg});
                            }
                        }
                    });
                }
                else{
                    new toast({text : '不能添加自己为好友'});
                }
            }
        }
    });

};

myChat.prototype.loadSearchFri = function(val){
    var self = this;
    util.ajax({
        url : '/getUserByFuzzy',
        type : 'post',
        data : {
            fuzzyQuery : val
        },
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200 || result.status === 404){
                var searchChilds = self.mainContainer[2].children;
                if(searchChilds.length > 1){
                    for(var i = 1,l = searchChilds.length;i < l;i++){
                        dom.remove(searchChilds[i]);
                        l--;
                        i--;
                    }
                }
                var friendList = result.data,tmpArr = [];
                if(friendList.length > 0){
                    for(i = 0,l = friendList.length;i < l;i++){
                        var temp = friendList[i];
                        tmpArr.push({
                            userName : temp['user_name'],
                            headUrl : '/head/' + temp['head_url'],
                            email : temp['email']
                        });
                    }

                    var frag =  document.createDocumentFragment();
                    for(i = 0,l = tmpArr.length;i < l;i++){
                        temp = tmpArr[i];
                        var listDom = dom.createByHTML('<div class="list">' +
                            '<img src="'+(temp.headUrl)+'" />' +
                            '<span title="'+(temp.userName)+'">'+(temp.userName)+'</span>' +
                            '<i data-friend-email = '+(temp.email)+' class="iconfont icon-tianjiahaoyou1" title = "添加"></i>' +
                            '</div>');
                        dom.append(frag,listDom);
                    }
                    dom.append(self.mainContainer[2],frag);
                }
                else{
                    new toast({text : '没有查找到该用户'});
                }
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};

/**
 * 动态加载好友列表
 */
myChat.prototype.loadList = function(){
    var self = this;
    self.initDom();
    self.initEvent();
    util.ajax({
        url : '/getFriendList',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200 || result.status === 404){
                self.listArr = result.data;
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};

/**
 * 更新好友列表
 */
myChat.prototype.update = function(){
    var self = this;
    util.ajax({
        url : '/getFriendList',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200 || result.status === 404){
                self.listArr = result.data;
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};

/**
 * 动态加载好友请求列表
 */
myChat.prototype.loadFriendReq = function(){
    var self = this;
    util.ajax({
        url : '/getFriendReq',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200 || result.status === 404){
                self.reqFirArr = result.data;
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};

/**
 * 显示该好友组件
 */
myChat.prototype.show = function(){
    this.update();
    this.backDrop.classList.remove('hide');
    this.backDrop.classList.add('show');
    this.chatDom.classList.add('chat-in-animate');
    this.chatDom.classList.remove('chat-out-animate');
};

/**
 * 隐藏该好友组件
 */
myChat.prototype.hide = function(){
    this.chatDom.classList.remove('chat-in-animate');
    this.chatDom.classList.add('chat-out-animate');
    this.backDrop.classList.remove('show');
    this.backDrop.classList.add('hide');
};