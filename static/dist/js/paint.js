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
function loadAnimate(par){
    this.dom = null;
    this.init();
    dom.append(par,this.dom);
    this.dom.addEventListener('click',function(e){
        e.stopPropagation();
        e.preventDefault();
    })
}
loadAnimate.prototype.init = function(){
    this.dom = dom.createByHTML('<div class="loadAnimate"><div class="load"><div class="loader">加载中...</div></div></div>');
};
loadAnimate.prototype.show = function(){
    dom.show(this.dom);
};
loadAnimate.prototype.hide = function(){
    dom.hide(this.dom);
};

function loading(para){
    this.text = para.text ? para.text : '默认';
    this.textDom = null;
    this.container = para.container ? para.container : document.body;
    this.backDrop = null;//弹框背景黑暗
    this.initDom();
}

loading.prototype.initDom = function(){
    this.backDrop = dom.createByHTML('<div class="modal-backdrop fade in"></div>');
    dom.append(this.container,this.backDrop);
    this.textDom = dom.createByHTML('<div class="loading-text"></div>');
    this.textDom.innerText = this.text;
    dom.append(this.container,this.textDom);
};

loading.prototype.setText = function(text){
    this.textDom.innerText = text;
};

loading.prototype.show = function(){
    this.backDrop.classList.remove('hide');
    this.backDrop.classList.add('show');
    this.textDom.classList.remove('hide');
    this.textDom.classList.add('show');
};
loading.prototype.hide = function(){
    this.backDrop.classList.remove('show');
    this.backDrop.classList.add('hide');
    this.textDom.classList.remove('show');
    this.textDom.classList.add('hide');
};
function Modal(para){
    this.para = para;
    this.modal = document.createElement('div');

    this.modalHeader = document.createElement('div');
    this.modalBody = document.createElement('div');

    this.init();

    this.modal.appendChild(this.modalHeader);
    this.modal.appendChild(this.modalBody);

    this.modal.classList.add('animated','bounceInDown');
    document.body.appendChild(this.modal);
}

Modal.prototype.init = function(){
    this.modal.classList.add('modal');
    this.modalHeader.classList.add('modalHeader');
    this.modalBody.classList.add('modalBody');
    this.initHeader();
};

Modal.prototype.initHeader = function(){
    var self = this;
    var closeIcon = document.createElement('i');
    closeIcon.classList.add('iconfont','icon-guanbi1','modalClose');
    closeIcon.addEventListener('click',function(){
        self.modal.classList.remove('bounceInDown');
        self.modal.classList.add('bounceOutDown');
        if(self.para.destory){
            setTimeout(function(){
                dom.remove(self.modal);
            },1000);
        }
        if(self.para.onClose && typeof self.para.onClose === 'function'){
            self.para.onClose();
        }
    });
    var title = document.createElement('span');
    title.classList.add('modalTitle');
    title.innerText = this.para.title;
    this.modalHeader.appendChild(title);
    this.modalHeader.appendChild(closeIcon);
};

Modal.prototype.getBody = function(){
    return this.modalBody;
};

Modal.prototype.getHeader = function(){
    return this.modalHeader;
};


Modal.prototype.show = function(){
    this.modal.classList.remove('bounceOutDown');
    this.modal.classList.add('bounceInDown');
};
Modal.prototype.hide = function(){
    this.modal.classList.remove('bounceInDown');
    this.modal.classList.add('bounceOutDown');
};
/**
 * 分页插件
 * @param para
 */
function pagePlugin(para){
    this.pageDom = null;//当前分页组件DOM
    this.curPage = 1;
    this.isOverPage = false;//判断分页插件是否超过父元素宽度
    if(typeof para === 'object'){
        this.totalCounts = para.totalCounts ? para.totalCounts : 1;//总个数
        this.onePageSize = para.onePageSize ? para.onePageSize : 1;//每页的个数
        this.totalPage = Math.ceil(this.totalCounts/this.onePageSize);//总页数
        this.container = para.container ? para.container : document.body;//分页插件的父节点容器
        this.cb = para.cb ? para.cb : null;//点击分页之后的回掉函数
    }
    this.totalPage > 1 ?  this.initDom() : null;
}
pagePlugin.prototype.destory = function(){
     dom.remove(this.pageDom);
};
pagePlugin.prototype.initDom = function(){
    this.pageDom = dom.createByHTML('<ul class="pagination"></ul>');
    var li,self = this;
    for(var i = 0;i < this.totalPage;i++){
        li = dom.createByHTML('<li><span>'+(i+1)+'</span></li>');
        dom.append(this.pageDom,li);
    }
    dom.append(this.container,this.pageDom);
    this.pageDom.addEventListener('click',function(e){
        var li = dom.closest(e.target,'li');
        if(li){
            self.curPage = parseInt(li.innerText);
            self.cb(self.curPage);
            self.updatePage();
        }
    });
    if(this.container.offsetWidth - 40 < this.pageDom.offsetWidth){
        this.isOverPage = true;
    }
    /*var ulAllWidth =(li.offsetWidth + 10)*this.totalPage;
    if(ulAllWidth > this.pageDom.offsetWidth + 2){
        this.isOverPage = true;
    }*/
};
pagePlugin.prototype.updatePage = function(){
    if(this.totalPage > 1){
        var pageChilds = Array.prototype.slice.call(this.pageDom.children),l;
        for(var i = 0;i < pageChilds.length;i++){
            if(pageChilds[i].nodeName === 'SPAN'){
                dom.remove(pageChilds[i]);
                pageChilds.splice(i,1);
                i--;
            }
            else{
                pageChilds[i].classList.remove('curPageSelect');
                pageChilds[i].classList.remove('hide');
            }
        }
        pageChilds[this.curPage - 1].classList.add('curPageSelect');
        if(this.isOverPage){
            if(this.curPage < 4){
                for(i = 5, l = pageChilds.length;i < l;i++){
                    pageChilds[i].classList.add('hide');
                }
                var span = dom.createByHTML('<span style="margin:0px 5px;">....</span>');
                dom.append(this.pageDom,span);
            }
            else if(this.curPage > this.totalPage - 3){
                for(i = 0, l = this.totalPage - 5;i < l;i++){
                    pageChilds[i].classList.add('hide');
                }
                var span = dom.createByHTML('<span style="margin:0px 5px;float: left;">....</span>');
                dom.prepend(this.pageDom,span);
            }
            else{
                for(i = 0, l = pageChilds.length;i < l;i++){
                    if(Math.abs(this.curPage - (i+1)) > 2){
                        pageChilds[i].classList.add('hide');
                    }
                }
                var spanBefore = dom.createByHTML('<span style="margin:0px 5px;float: left;">....</span>');
                dom.prepend(this.pageDom,spanBefore);
                var spanAfter = dom.createByHTML('<span style="margin:0px 5px;float: right;">....</span>');
                dom.append(this.pageDom,spanAfter);
            }
        }
    }
};
function share(){
    this.container = dom.createByHTML('<div data-show=0></div>');
    this.container.classList.add('iShare');
    this.init();
    this.bindEvent();
    dom.append(document.body,this.container);
}
share.prototype.init = function(){
    var qZoneDom = dom.createByHTML('<a href="#" class="iShare_qzone"><i class="iconfont icon-qunfengqqkongjian"></i></a>');
    dom.append(this.container,qZoneDom);
    var weChatDom = dom.createByHTML('<a href="#" class="iShare_wechat"><i class="iconfont icon-weixin-copy1"></i></a>');
    dom.append(this.container,weChatDom);
    var shareBtn = dom.createByHTML('<i class="iconfont icon-tubiao212 shareBtn"></i>');
    dom.prepend(this.container,shareBtn);
};
share.prototype.bindEvent = function(){
    var self = this;
    this.container.addEventListener('click',function(){
        if(parseInt(self.container.dataset.show)){
            self.container.style.right = '-80px';
            self.container.dataset.show = 0;
        }
        else{
            self.container.style.right = '0px';
            self.container.dataset.show = 1;
        }
    })
};
var iShare_config = {
    container:'.iShare',
    config:{
        title: 'iDraw',
        description: 'iDraw画图猜词游戏平台',
        url: 'http://39.108.120.228:3000',
        WXoptions:{
            evenType: 'click',
            isTitleVisibility: true,
            isTipVisibility: true,
            tip: 'iDraw画图猜词游戏平台',
            title: 'iDraw',
            bgcolor: 'white'
        }
    }
}
function simpleModal(para){
    this.backDrop = null;//弹框背景黑暗
    this.modalDom = null;//弹框节点
    this.modalHeader = null;//弹框顶部节点
    this.modalBody = null;//弹框body中部节点
    this.modalFooter = null;//弹框底部节点
    this.body = para.body;
    this.btn = para.btn;//弹框底部按钮节点列表
    this.title = para.title ? para.title : '默认标题';
    this.onClose = para.onClose ? (typeof para.onClose === 'function' ? para.onClose : function(){}) : function(){};
    this.initDom();//初始化弹框
    this.initEvent();//初始化弹框点击事件
}
simpleModal.prototype.initDom = function(){
    this.backDrop = dom.createByHTML('<div class="modal-backdrop fade in"></div>');
    dom.append(document.body,this.backDrop);

    this.modalDom = dom.createByHTML('<div class="simple-modal"></div>');
    this.modalHeader = dom.createByHTML('<div class="modal-header"><h4>'+(this.title)+'</h4><i class="iconfont icon-guanbi1"></i></div>');
    this.modalBody = dom.createByHTML('<div class="modal-body"></div>');
    this.modalFooter = dom.createByHTML('<div class="modal-footer"></div>');

    if(this.body){
        this.modalBody.innerHTML = this.body;
    }
    for(var i = 0,l = this.btn.length;i < l;i++){
        dom.append(this.modalFooter,dom.createByHTML('<button class="btn btn-default" data-id = '+(i)+' >'+(this.btn[i].text)+'</button>'));
    }

    dom.append(this.modalDom,this.modalHeader);
    dom.append(this.modalDom,this.modalBody);
    dom.append(this.modalDom,this.modalFooter);
    dom.append(document.body,this.modalDom);

    this.modalDom.classList.add('modal-in-animate');
};

simpleModal.prototype.initEvent = function(){
    var self = this,closeIcon = dom.query('i',this.modalHeader);
    this.backDrop.addEventListener('click',function(){
        self.onClose.call(this,null);
        self.destory();
    });
    closeIcon.addEventListener('click',function(){
        self.onClose.call(this,null);
        self.destory();
    });
    this.modalFooter.addEventListener('click',function(e){
        var target = e.target;
        if(target.tagName === 'BUTTON'){
            var btnId = parseInt(target.dataset.id);
            typeof self.btn[btnId].cb === 'function' && self.btn[btnId].cb.call(target);
        }
    });
};

simpleModal.prototype.getBody = function(){
    return dom.query('.modal-body',this.modalDom);
};
simpleModal.prototype.destory = function(){
    var self = this;
    self.backDrop.classList.remove('in');
    self.modalDom.classList.remove('modal-in-animate');
    self.modalDom.classList.add('modal-out-animate');
    setTimeout(function(){
        dom.remove(self.backDrop);
        dom.remove(self.modalDom);
    },150);
};
function toast(para){
    this.container = para.container ? para.container : document.body;
    this.text = para.text ? para.text : '默认';
    this.time = para.time ? para.time : 3000;
    this.toastDom = null;
    this.init();
    this.destory();
}
toast.prototype.init = function(){
    this.toastDom = dom.createByHTML('<div class="toast animateFadeIn"><span>'+(this.text)+'</span></div>');
    dom.append(this.container,this.toastDom);
};
toast.prototype.destory = function(){
    var self = this;
    setTimeout(function(){
        self.toastDom.classList.remove('animateFadeIn');
        self.toastDom.classList.add('animateFadeOut');
        setTimeout(function(){
            dom.remove(self.toastDom);
        },1000);
    },this.time - 1000)
};
//点信息
function Pos(x,y) {
    this.x=x;
    this.y=y;
}
//路径信息
function Path(pts,lw,color) {
    this.pts = pts;
    this.lw = lw || canvas.lw;
    this.color = color || canvas.color;
}
//擦除区域
function Rect(x,y,w,h) {
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
}

//清空部分画布方法
Rect.prototype.clearOn = function (ctx) {
    ctx.clearRect(this.x,this.y,this.w,this.h);
};
//绘制矩形方法
Rect.prototype.drawRect = function(ctx){
    ctx.strokeRect(this.x,this.y,this.w,this.h);
};
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
(function(){
    window.pDom = { };
    window.domInit = function(){
        this.pDom = {
            pen : dom.query('#pen'), //铅笔
            erase : dom.query('#erase'),//橡皮擦
            clear : dom.query('#clear'),//清空画布
            myColor : dom.query('#myColor'),//画笔颜色选择器
            penWidth : dom.query('#penWidth'),//画笔粗细选择器
            addTime : dom.query('#addTime'),//增加本轮作画时间
            changeWord : dom.query('#changeWord'),//更改本回合自己的关键字
            gameCenter : dom.query('#gameCenter'),//游戏中心界面
            roomClose : dom.query('#roomClose'),//离开房间按钮
            loading : dom.query('#loading'),//加载效果
            currentSer : dom.query('#currentSer'),//显示当前大区节点
            selectRoom : dom.query('#selectRoom'),//选择房间节点
            header : dom.query('#header'),//头部节点
            ready : dom.query('#ready'),//准备按钮
            readyText : dom.query('.gc-top-text',pDom.ready),//准备文本
            lock : dom.query('#lock'),//房间加锁按钮
            sendInvate : dom.query('#sendInvate'),//发送游戏邀请
            paintMain : dom.query('#paintMain'),//canvas界面dom
            userList : dom.query('#userList'),//用户准备界面dom
            leftTime : dom.query('#leftTime'),//剩余时间dom
            curData : dom.query('.cur-data'),
            keyWord : dom.query('#keyWord',pDom.curData),//关键字
            showDraw : dom.query('#showDraw'),//显示当前绘画结果
            back : dom.query('#back'),//遮罩
            topMenu : dom.query('.top-menu'),//移动端顶部菜单按钮
            message : dom.query('#message'),
            sendInput : dom.query('.sendInput',pDom.message),
            send : dom.query('.send',pDom.message),
            gameUser : dom.query('#gameUser'),
            msgList : dom.query('#msgList'),
            drawUtil : dom.query('.draw-util')
        };
    };
})();
(function(){
    var menuReactFun = (function(){
        var modalList = {
            userDataModal : {action : 'userData'},
            rankModal : {action : 'rank'},
            rewardModal : {action : 'reward'},
            storeModal : {action : 'store'},
            packModal : {action : 'pack'},
            galleryModal : {action : 'gallery'}
        };
        var curShow = null;
        var cancle = function(){
            util.ajax({
                url : '/cancle',
                type : 'get',
                success : function(data){
                    if(data === '注销成功'){
                        window.location.href= window.location.origin + '/loginPage';
                    }
                }
            });
        };
        var userData = function(){
            closeMenu();
            curShow && curShow.hide();
            var curModal = modalList.userDataModal.modal;
            if(curModal){
                curModal.show();
                modalList.userDataModal.dataInit.update();
            }
            else{
                modalList.userDataModal.modal = new Modal({
                    title : '个人信息'
                });
                modalList.userDataModal.dataInit  = new initUser(modalList.userDataModal.modal.getBody());
            }
            curShow = curModal;
        };
        var rank = function(){
            closeMenu();
            curShow && curShow.hide();
            var curModal = modalList.rankModal.modal;
            if(curModal){
                curModal.show();
                modalList.rankModal.dataInit.update();
            }
            else{
                modalList.rankModal.modal = new Modal({
                    title : '排行榜'
                });
                modalList.rankModal.dataInit  = new initRank(modalList.rankModal.modal.getBody());
            }
            curShow = curModal;
        };
        var reward = function(){
            closeMenu();
            curShow && curShow.hide();
            var curModal = modalList.rewardModal.modal;
            if(curModal){
                curModal.show();
                modalList.rewardModal.dataInit.update();
            }
            else{
                modalList.rewardModal.modal = new Modal({
                    title : '每日奖励'
                });
                modalList.rewardModal.dataInit  = new initReward(modalList.rewardModal.modal.getBody());
            }
            curShow = curModal;
        };
        var store = function(){
            closeMenu();
            curShow && curShow.hide();
            var curModal = modalList.storeModal.modal;
            if(curModal){
                curModal.show();
                modalList.storeModal.dataInit.update();
            }
            else{
                modalList.storeModal.modal = new Modal({
                    title : '商城'
                });
                modalList.storeModal.dataInit  = new initStore(modalList.storeModal.modal.getBody());
            }
            curShow = curModal;
        };
        var pack = function(){
            closeMenu();
            curShow && curShow.hide();
            var curModal = modalList.packModal.modal;
            if(curModal){
                curModal.show();
                modalList.packModal.dataInit.update();
            }
            else{
                modalList.packModal.modal = new Modal({
                    title : '背包'
                });
                modalList.packModal.dataInit  = new initPack(modalList.packModal.modal.getBody());
            }
            curShow = curModal;
        };
        var gallery = function(){
            closeMenu();
            curShow && curShow.hide();
            var curModal = modalList.galleryModal.modal;
            if(curModal){
                curModal.show();
                modalList.galleryModal.dataInit.update();
            }
            else{
                modalList.galleryModal.modal = new Modal({
                    title : '画廊'
                });
                modalList.galleryModal.dataInit  = new initGallery(modalList.galleryModal.modal.getBody());
            }
            curShow = curModal;
        };
        var closeMenu = function(){
            if(!util.isPc()){
                pDom.header.getAttribute('style') ? pDom.header.removeAttribute('style') : pDom.header.setAttribute('style','height : 400px;');
            }
        };
        var clickHandle = function(e){
            if(!dom.closest(e.target,'.modal')){
                var navIcon = dom.closest(e.target,'.nav-icon-con');
                for(var key in modalList){
                    var temp = modalList[key];
                    if(temp){
                        if(navIcon){
                            if(navIcon.dataset.action !== temp.action){
                                temp.modal && temp.modal.hide();
                            }
                        }
                        else{
                            temp.modal && temp.modal.hide();
                        }
                    }
                }
            }
        };
        document.body.addEventListener('click',clickHandle);
        document.body.addEventListener('touch',clickHandle);
        return {
            cancle : cancle,
            userData : userData,
            rank : rank,
            reward : reward,
            store : store,
            pack :pack,
            gallery :gallery
        }
    })();
    window.chat = null;
    //页面事件初始化
    window.eventInit = function(){
        //离开房间按钮
        pDom.roomClose.addEventListener('click',function(){
            dom.hide(pDom.gameCenter);//游戏中心隐藏
            dom.show(pDom.selectRoom);//选择房间界面显示
            dom.hide(pDom.paintMain);//画布界面隐藏
            dom.show(pDom.userList);//准备界面显示
            dom.show(pDom.loading);//缓冲界面显示
            document.body.removeEventListener('touchmove',reactComFun.mbPreventDefault);
            pDom.readyText.innerText = '准备';
            clientSocket.closeSocket();//关闭当前游戏socket
            reactEvent.stopAll(clientSocket.getSocket());
            dom.show(pDom.ready);
            pDom.lock.classList.remove('hide');
            pDom.sendInvate.classList.remove('hide');
        });
        //选择画笔点击事件
        pDom.pen.addEventListener('click',function(){
            delete canvas.erase;
            var rect = new Rect(preErase.x,preErase.y,preErase.w,preErase.h);
            rect.clearOn(ctx);
        });
        //橡皮擦点击事件
        pDom.erase.addEventListener('click',function () {
            canvas.erase=true;
        });
        //清空画布点击事件
        pDom.clear.addEventListener('click',function () {
            var curSocket = clientSocket.getSocket();
            curSocket.emit('clearPaint',null);
        });
        //画笔颜色选择点击事件
        pDom.myColor.addEventListener('click',function () {
            var colorPicker = dom.query('.colorContainer',pDom.paintMain);
            if(!colorPicker){
                var colorContainer = dom.createByHTML('<div></div>');
                colorContainer.classList.add('colorContainer');
                var oneRowColorSize = util.isPc() ? 24 : Math.ceil((document.body.clientWidth-20) / 60) * 4;
                for(var i = 0;i < oneRowColorSize;i++){
                    var colorDiv = dom.createByHTML('<div></div>'),randomColor = util.randomColor();
                    colorDiv.classList.add('oneColor');
                    colorDiv.style.backgroundColor = randomColor;
                    colorDiv.dataset.color = randomColor;
                    dom.append(colorContainer,colorDiv);
                }
                dom.append(pDom.paintMain,colorContainer);
                colorContainer.addEventListener('click',function(e){
                    canvasUtil.setColor(canvas,e.target.dataset.color);
                });
            }
            else{
                dom.show(colorPicker);
            }
        });
        //画笔粗细选择器点击事件
        pDom.penWidth.addEventListener('click',function () {
            var widthPicker = dom.query('.widthContainer',pDom.paintMain);
            if(!widthPicker) {
                var widthContainer = dom.createByHTML('<div></div>');
                widthContainer.classList.add('widthContainer');
                for(var i = 0;i < 4;i++){
                    var penWithDegree = dom.createByHTML('<div data-width = "'+(i+1)+'"><div data-width = "'+(i+1)+'"></div></div>');
                    dom.append(widthContainer,penWithDegree);
                }
                dom.append(pDom.paintMain,widthContainer);
                widthContainer.addEventListener('click',function(e){
                    canvasUtil.setLw(canvas,e.target.dataset.width);
                });
            }
            else{
                dom.show(widthPicker);
            }
        });
        //增加作画时间点击事件
        pDom.addTime.addEventListener('click',function () {
            var par = pDom.addTime.parentElement;
            if(dom.query('.wait',par)){
                return false;
            }
            paintCom.addWait(par);
            util.ajax({
                url : '/reduceUserGoods',
                type : 'post',
                data : {
                    goodsId : 3
                },
                success : function(data){
                    var result = JSON.parse(data);
                    if(result.status === 200){
                        var curSocket = clientSocket.getSocket();
                        curSocket.emit('addTime',null);
                    }
                    else{
                        new toast({text : result.errorMsg});
                    }
                }
            });
        });
        //更改当前回合自己的关键词点击事件
        pDom.changeWord.addEventListener('click',function () {
            var par = pDom.changeWord.parentElement;
            if(dom.query('.wait',par)){
                return false;
            }
            paintCom.addWait(par);
            util.ajax({
                url : '/reduceUserGoods',
                type : 'post',
                data : {
                    goodsId : 2
                },
                success : function(data){
                    var result = JSON.parse(data);
                    if(result.status === 200){
                        var curSocket = clientSocket.getSocket();
                        curSocket.emit('changeWord',null);
                    }
                    else{
                        new toast({text : result.errorMsg});
                    }
                }
            });
        });
        //准备按钮点击事件
        pDom.ready.addEventListener('click',function () {
            var text = pDom.readyText;
            var curSocket = clientSocket.getSocket();
            if(text && text.innerText === '准备'){
                text.innerText = '取消准备';
                curSocket.emit('ready',null);
                reactEvent.stopAll(curSocket);
            }
            else{
                text.innerText = '准备';
                curSocket.emit('cancleReady',null);
            }
        });
        //手机端顶部菜单切换按钮
        pDom.topMenu.addEventListener('click',function (e) {
            e.preventDefault();
            pDom.header.getAttribute('style') ? pDom.header.removeAttribute('style') : pDom.header.setAttribute('style','height : 400px;');
        });
        //监听手机端输入框聚焦事件
        pDom.sendInput.addEventListener('focus',function(){
            if(!util.isPc()){
                document.body.scrollTop = 0;
                pDom.message.style.top = '0px';
                pDom.message.style.bottom = '';
            }
        });
        //监听手机端输入框失焦事件
        pDom.sendInput.addEventListener('blur',function(){
            if(!util.isPc()){
                document.body.scrollTop = 0;
                pDom.message.style.top = '';
                pDom.message.style.bottom = '0px';
            }
        });
        //监听文本发送按钮
        pDom.send.addEventListener('click',function () {
            var sendMsg = pDom.sendInput.value;
            if(pDom.showDraw.classList.contains('show')){
                new toast({text : '本回合已结束，等下回合发送信息'});
                return false;
            }
            if(sendMsg !== ''){
                var curSocket = clientSocket.getSocket();
                var sendData = {
                    msg : pDom.sendInput.value,
                    curUser : cache.get('paintUserEmail')
                };
                curSocket.send(JSON.stringify(sendData));
                pDom.sendInput.value = '';
            }
            document.body.scrollTop = 0;
        });
        //监听发送文本框回车事件
        pDom.sendInput.addEventListener('keyup',function(e){
            var event = e || window.event;
            if (event.keyCode == "13") {
                pDom.send.click();
                this.value = "";
            }
        });
        //监听发送游戏邀请事件
        pDom.sendInvate.addEventListener('click',function(e){
            if(!chat){
                chat = new myChat({
                    container : pDom.gameCenter,
                    curSocket : function(){
                        return clientSocket.getSocket();
                    },
                    roomId : function(){
                        return room.getRoomId();
                    }
                });
            }
            else{
                chat.show();
            }
        });

        pDom.userList.addEventListener('click',function(e){
            var target = e.target;
            var friendEmail = target.dataset.friendEmail;
            if(target.tagName === 'I' && friendEmail){
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
        });

        //房间加锁按钮点击事件
        pDom.lock.addEventListener('click',function () {
            var self = this;
            if(this.dataset.hasOpen === '1'){
                return;
            }
            var curSocket = clientSocket.getSocket();
            var lockModal = new simpleModal({
                title : '添加房间密码',
                onClose : function(){
                    self.dataset.hasOpen = 0;
                },
                btn : [{text : '确认',
                    cb : function(){
                        self.dataset.hasOpen = 0;
                        var lockVal = dom.query('input',inputDom).value;
                        if(lockVal !== ''){
                            curSocket.emit('addRoomLock',JSON.stringify({lockVal : lockVal,roomId : room.getRoomId()}));
                            lockModal.destory();
                            new toast({text : '添加房间锁成功'});
                        }
                        else{
                            new toast({text : '密码不能为空'});
                        }
                    }
                },{text : '取消房间加密',
                    cb : function(){
                        self.dataset.hasOpen = 0;
                        curSocket.emit('delRoomLock',JSON.stringify({roomId : room.getRoomId()}));
                        lockModal.destory();
                        new toast({text : '取消房间锁成功'});
                    }
                }]
            });
            var inputDom = dom.createByHTML('<div><input type="text" class="modal-input" placeholder="请输入密码" autofocus /></div>');
            dom.append(lockModal.getBody(),inputDom);

            this.dataset.hasOpen = 1;
        });

        //监听顶部菜单栏
        pDom.header.addEventListener('click',function (e) {
            var target = e.target.classList.contains('nav-icon-con') ? e.target : e.target.parentElement;
            switch(target.dataset.action){
                case "cancle"://注销
                    menuReactFun.cancle();
                    break;
                case "userData"://个人信息
                    menuReactFun.userData();
                    break;
                case "rank"://排行榜
                    menuReactFun.rank();
                    break;
                case "reward"://每日奖励
                    menuReactFun.reward();
                    break;
                case "store"://商城
                    menuReactFun.store();
                    break;
                case "pack"://背包
                    menuReactFun.pack();
                    break;
                case "gallery"://画廊
                    menuReactFun.gallery();
                    break;

            }
        });

        document.body.addEventListener('click',function(e){
            if(!e.target.classList.contains('myColor')){
                var colorPicker = dom.query('.colorContainer');
                colorPicker && dom.hide(colorPicker);
            }
            if(!e.target.classList.contains('penWidth')){
                var penWidthPicker = dom.query('.widthContainer');
                penWidthPicker && dom.hide(penWidthPicker);
            }
        });
    }
})();
function initGallery(parModal){
    this.curImg = null;//保存当前图片节点
    this.userDom = null;//保存当前图片作画者节点
    this.goodNumDom = null;//保存当前图片点赞数节点
    this.parModal = parModal;
    this.loadAnimate = new loadAnimate(parModal.parentElement);
    this.imgArr = [];
    this.tempImgArr = '../../../img/noImg.jpg';
    this.loadDataImg();
}
initGallery.prototype.initDom = function(){
    this.parModal.innerHTML = '';
    var imgContainer = dom.createByHTML('<div class="imgContainer"></div>');
    var goodImg = dom.createByHTML('<div class="goodImg"></div>');
    this.curImg = dom.createByHTML('<img class="curImg" src="'+(this.imgArr[0].imgSrc)+'" />');
    this.userDom = dom.createByHTML('<span >'+(this.imgArr[0].userName)+'</span>');
    this.goodNumDom = dom.createByHTML('<span><i class="iconfont icon-dianzan"></i>'+(this.imgArr[0].goodNum)+'</span>');
    dom.append(goodImg,this.curImg);
    dom.append(imgContainer,goodImg);
    dom.append(this.parModal,imgContainer);
    dom.append(goodImg,this.userDom);
    dom.append(goodImg,this.goodNumDom);
};
initGallery.prototype.loadDataImg = function(){
    var self = this;
    self.loadAnimate.show();
    util.ajax({
        url : '/getGalleryImg',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            self.parModal.innerHTML = '';
            if(result.status === 200){
                var imgArr = result.data,
                    temp = [];
                for(var i = 0,l = imgArr.length;i < l;i++){
                    var cache = imgArr[i];
                    temp.push({
                        imgSrc : '../../../../paint/'+cache.img_url,
                        userName : cache.user_name,
                        goodNum : cache.img_points_num
                    });
                }
                self.imgArr = temp;
                self.initDom();
                self.pageDom && self.pageDom.destory();
                self.pageDom = new pagePlugin({
                    totalCounts : self.imgArr.length < 10 ? self.imgArr.length : 10,
                    onePageSize : 1,
                    container : self.parModal,
                    cb : function(curPageNum){
                        var imgSrc = (self.imgArr[curPageNum-1] && self.imgArr[curPageNum-1].imgSrc) || self.tempImgArr;
                        self.curImg.src = imgSrc;
                        self.userDom.innerText = (imgSrc === self.tempImgArr) ? '' : self.imgArr[curPageNum-1].userName;
                        self.goodNumDom.innerHTML = (imgSrc === self.tempImgArr) ? '' : '<i class="iconfont icon-dianzan"></i>'+self.imgArr[curPageNum-1].goodNum;
                    }
                });
                self.pageDom.updatePage();
                self.loadAnimate.hide();
            }
            else if(result.status === 404){
                self.parModal.innerHTML = '<span>画廊暂无数据,快去参加比赛吧!!!</span>';
                self.loadAnimate.hide();
            }
            else{
                new toast({text :result.errorMsg});
            }
        }
    });
};
initGallery.prototype.update = function(){
        this.loadDataImg();
};

function initPack(parModal){
    this.parModal = parModal;
    this.loadAnimate = new loadAnimate(parModal.parentElement);
    this.loadPackList();
    this.goodsArr = null;
}
initPack.prototype.loadPackList = function(){
    var self = this;
    self.loadAnimate.show();
    util.ajax({
        url : '/getUserPackGoods',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200){
                self.parModal.innerHTML = '';
                var packArr = result.data,
                    temp = [];
                for(var i = 0,l = packArr.length;i < l;i++){
                    var cache = packArr[i];
                    temp.push({
                        goodsName : cache['goods_name'],
                        goodsNum : cache['goods_num'],
                        goodsImgSrc : '../../../img/' + cache['goods_img']
                    });
                }
                self.goodsArr = temp;
                self.initDom();
                self.loadAnimate.hide();
            }
            else if(result.status === 404){
                self.parModal.innerHTML = '<span>背包暂无商品，快去购买吧!!!</span>';
                self.loadAnimate.hide();
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};
initPack.prototype.initDom = function(){
    this.parModal.innerHTML = '';
    var packContainer = dom.createByHTML('<div class="packContainer"></div>');
    for(var i = 0,l = this.goodsArr.length;i < l;i++){
        dom.append(packContainer,dom.createByHTML('<div> ' +
            '<img src = "'+(this.goodsArr[i].goodsImgSrc)+'"/> ' +
            '<span>'+(this.goodsArr[i].goodsName)+'</span>' +
            '<span>'+(this.goodsArr[i].goodsNum)+'</span>'+
            ' </div>'));
    }
    dom.append(this.parModal,packContainer);
};
initPack.prototype.update = function(){
    this.loadPackList();
};

function initStore(parModal){
    this.parModal = parModal;
    this.loadAnimate = new loadAnimate(parModal.parentElement);
    this.loadStoreList();
    this.storeList = null;
}
initStore.prototype.loadStoreList = function(){
    var self = this;
    self.loadAnimate.show();
    util.ajax({
        url : '/getStoreAllGoods',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200){
                var goodsArr = result.data,
                    temp = [];
                for(var i = 0,l = goodsArr.length;i < l;i++){
                    var cache = goodsArr[i];
                    temp.push({
                        goodsName : cache['goods_name'],
                        goodsPrice : cache['goods_price'],
                        goodsImgSrc : '../../../img/' + cache['goods_img'],
                        goodsId : cache['goods_id']
                    });
                }
                self.storeList = temp;
                self.initDom();
                self.loadAnimate.hide();
            }
            else if(result.status === 404){
                new toast({text : '商城数据为空'});
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};
initStore.prototype.initDom = function(){
     var storeContainer = dom.createByHTML('<div class="storeContainer"></div>');
     var self = this;
     for(var i = 0,l = this.storeList.length;i < l;i++){
         var temp = this.storeList[i];
         var storeGoodsCon = dom.createByHTML('<div></div>');
         var goodsImg = dom.createByHTML('<img />');
         goodsImg.src = temp.goodsImgSrc;
         var storeGoodsPrice = dom.createByHTML('<span><i class="iconfont icon-qiandai"></i>'+(temp.goodsPrice)+'</span>');
         var buyButton = dom.createByHTML('<button></button>');
         buyButton.innerText = '买';
         buyButton.dataset.goodsId = temp['goodsId'];
         buyButton.addEventListener('click',function(e){
             self.buy(e.target.dataset.goodsId);
         });
         dom.append(storeGoodsCon,goodsImg);
         dom.append(storeGoodsCon,storeGoodsPrice);
         dom.append(storeGoodsCon,buyButton);
         dom.append(storeContainer,storeGoodsCon);
     }
     dom.append(this.parModal,storeContainer);
};
initStore.prototype.buy = function(goodsId){
    util.ajax({
        url : '/buyGoods',
        type : 'post',
        data : {
            goodsId : goodsId
        },
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200){
                new toast({text : '道具购买成功'});
            }
            else{
                new toast({text : result.errorMsg});
            }
        }
    });
};
initStore.prototype.update = function(){};

function initReward(parModal){
    this.parModal = parModal;
    this.rewardList = [{goodsName : '点赞卡',goodsId:1,goodsImgSrc:'../../../img/tools1.png'},
        {goodsName : '换词卡',goodsId:2,goodsImgSrc:'../../../img/tools6.png'},
        {goodsName : '加时卡',goodsId:3,goodsImgSrc:'../../../img/tools4.png'},
        {goodsName : '金币',goodsId:0,goodsImgSrc:'../../../img/tools2.png'},
        {goodsName : '么么哒',goodsId:4,goodsImgSrc:'../../../img/tools3.png'},
        {goodsName : '番茄',goodsId:5,goodsImgSrc:'../../../img/tools5.png'},
        {goodsName : '糖果',goodsId:6,goodsImgSrc:'../../../img/tools7.png'}];
    this.todayGoodsId = null;
    this.initDom();
}
initReward.prototype.initDom = function(){
    var rewardContainer = dom.createByHTML('<div class="rewardContainer"></div>'),self = this;
    var today = new Date().getDay();
    for(var i = 0;i < 7;i++){
        var temp = this.rewardList[i];
        var rewardDayCon = dom.createByHTML('<div></div>');
        var rewardGoodsTop = dom.createByHTML('<div class="reward"></div>');
        var rewardGoodsImg = dom.createByHTML('<img />');
        var goodsName = dom.createByHTML('<span></span>');
        rewardGoodsTop.innerText = '第' + (i+1) + "天";
        goodsName.innerText = temp.goodsName;
        rewardGoodsImg.src = temp.goodsImgSrc;
        dom.append(rewardDayCon,rewardGoodsTop);
        dom.append(rewardDayCon,rewardGoodsImg);
        dom.append(rewardDayCon,goodsName);
        dom.append(rewardContainer,rewardDayCon);
        if(today === 0 && i === 6){
            rewardGoodsTop.classList.add('rewardToday');
            this.todayGoodsId = temp.goodsId;
        }
        if(today - i === 1){
            rewardGoodsTop.classList.add('rewardToday');
            this.todayGoodsId = temp.goodsId;
        }
    }
    var tipSpan = dom.createByHTML('<span>累计登录七天领取绘画奖励，每周一重置</span>');
    var receiveBtn = dom.createByHTML('<button></button>');
    receiveBtn.innerText = '领取';
    if(cache.get(cache.get('email') + 'hasReceive') === '1'){
        receiveBtn.innerText = '今日已领取';
        receiveBtn.setAttribute('disabled','disabled');
        receiveBtn.classList.add('btn-disabled');
    }
    receiveBtn.addEventListener('click',function(e){
        self.getGoods();
        receiveBtn.innerText = '今日已领取';
        receiveBtn.setAttribute('disabled','disabled');
        receiveBtn.classList.add('btn-disabled');
        cache.add(cache.get('email') + 'hasReceive','1');
    });
    dom.append(rewardContainer,tipSpan);
    dom.append(rewardContainer,receiveBtn);
    dom.append(this.parModal,rewardContainer);
};
initReward.prototype.getGoods = function(){
    //新增金币
    if(this.todayGoodsId === 0){
        util.ajax({
            url : '/updateUser',
            type : 'post',
            data : {
                updateData:JSON.stringify({
                    gold_num : 100
                })
            },
            success : function(data){
                var result = JSON.parse(data);
                if(result.status === 200){
                    new toast({text : '金币领取成功'});
                }
                else{
                    new toast({text : result.errorMsg});
                }
            }
        });
    }
    //新增道具
    else{
        util.ajax({
            url : '/addUserGoods',
            type : 'post',
            data : {
                goodsId : this.todayGoodsId
            },
            success : function(data){
                var result = JSON.parse(data);
                if(result.status === 200){
                    new toast({text : '道具领取成功'});
                }
                else{
                    new toast({text : result.errorMsg});
                }
            }
        });
    }
};
initReward.prototype.update = function(){};

function initRank(parModal){
    this.parModal = parModal;
    this.loadAnimate = new loadAnimate(parModal.parentElement);
    this.giveMeMoreDom = null;//保存送我糖果最多的显示dom
    this.meGiveMoreDom = null;//保存我送糖果最多的dom
    this.rankListDom = null;//保存排行榜dom
    this.myCharmDom = null;//保存我的魅力值dom
    this.rankRightCon = null;
    this.pageDom = null;
    this.rankList = null;
    this.initDom();
    this.onePageSize = Math.floor((this.rankRightCon.offsetHeight - dom.query('.topCon',this.rankRightCon).offsetHeight - 30)/30) - 1;
    this.loadRankData('charm');
    this.loadMyData();
}
initRank.prototype.loadRankData = function(type){
    var self = this;
    self.loadAnimate.show();
    util.ajax({
        url : type === 'charm' ? '/getCharmRank' : '/getSlotsRank',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200){
                var rankArr = result.data,
                    temp = [];
                for(var i = 0,l = rankArr.length;i < l;i++){
                    var cache = rankArr[i];
                    temp.push({
                        userName : cache['user_name'],
                        receiveGoods : type === 'charm' ? cache['charm_num'] : cache['slots_num'],
                        imgUrl : '../../../../head/' + cache['head_url']
                    });
                }
                self.rankList = temp;
                self.initRankData(self.rankList.slice(0,self.onePageSize),0);
                self.pageDom && self.pageDom.destory();
                self.pageDom = new pagePlugin({
                    totalCounts : self.rankList.length,
                    onePageSize : self.onePageSize,
                    container : self.rankRightCon,
                    cb : function(curPageNum){
                        self.initRankData(self.rankList.slice((curPageNum-1)*self.onePageSize,curPageNum*self.onePageSize),(curPageNum-1)*self.onePageSize);
                    }
                });
                self.pageDom.updatePage();
                self.loadAnimate.hide();
            }
            else if(result.status === 404){
                new toast({text : '排行榜信息为空'});
            }
           else{
                new toast({text : result.errorMsg});
            }
        }
    });
};
initRank.prototype.initDom = function(){
    var rankContainer = dom.createByHTML('<div class="rankContainer"></div>');
    var rankLeftCon = dom.createByHTML('<div class="rankLeftCon">' +
        '<div><span>我的魅力数</span><span class="myCharm">0</span></div>' +
        '<div><p>谁送我么么哒糖果最多</p><div class="giveMeMore"></div></div>' +
        '<div><p>我心仪的人</p><div class="meGiveMore"></div></div></div>');
     this.rankRightCon = dom.createByHTML('<div class="rankRightCon">' +
        '<div class="topCon"><div class="rankSelect" data-type = "charm">魅力榜</div><div data-type = "slots">吐槽榜</div></div>' +
        '<div class="rankList"></div>' +
        '</div>');
     var topCon = dom.query('.topCon',this.rankRightCon),self = this;
     topCon.addEventListener('click',function(e){
        var topConChild = topCon.children,
            target = e.target;
        for(var i = 0,l = topConChild.length;i < l;i++){
            topConChild[i].classList.remove('rankSelect');
        }
        target.classList.add("rankSelect");
        if(target.dataset.type === 'charm'){
            self.loadRankData('charm');
        }
        else{
            //获取吐槽榜排行榜数据
            self.loadRankData('slots');
        }
    });
    dom.append(rankContainer,rankLeftCon);
    dom.append(rankContainer,this.rankRightCon);
    dom.append(this.parModal,rankContainer);
    this.giveMeMoreDom = dom.query('.giveMeMore',rankLeftCon);
    this.meGiveMoreDom = dom.query('.meGiveMore',rankLeftCon);
    this.myCharmDom = dom.query('.myCharm',rankLeftCon);
    this.rankListDom = dom.query('.rankList',this.rankRightCon);
};
initRank.prototype.initRankData = function(rankList,startNum){
    var cacheDom = document.createDocumentFragment();
    this.rankListDom.innerHTML = '';
    var titleDom = dom.createByHTML('<div>' +
        '<div><span>排名</span></div>' +
        '<div><span>玩家名称</span></div>' +
        '<div><span>数量</span></div>' +
        '</div>');
    dom.append(cacheDom,titleDom);
    for(var i = 0,l = rankList.length;i < l;i++){
        var temp = rankList[i];
        var can = dom.createByHTML('<div>' +
            '<div><span>'+(i+startNum+1)+'</span></div>' +
            '<div><img src="'+(temp.imgUrl)+'" /><span>'+(temp.userName)+'</span></div>' +
            '<div><span>'+(temp.receiveGoods)+'</span></div>' +
            '</div>');
        dom.append(cacheDom,can);
    }
    dom.append(this.rankListDom,cacheDom);
};
initRank.prototype.initMyData = function(myCharmNum,giveMeMoreUserData,meGiveMoreUserData){
    this.myCharmDom.innerText = myCharmNum;
    this.giveMeMoreDom.innerHTML = '';
    this.meGiveMoreDom.innerHTML = '';
    if(giveMeMoreUserData){
        var giveMeUserDom = dom.createByHTML('<div>' +
            '<img src="'+(giveMeMoreUserData.headUrl)+'" />' +
            ' <span title="'+(giveMeMoreUserData.userName)+'">'+(giveMeMoreUserData.userName)+'</span>' +
            '</div>');
        dom.append(this.giveMeMoreDom,giveMeUserDom);
    }
    else{
        var tips = dom.createByHTML('<span>主动出击,先送上魅力值引起TA的注意</span>');
        dom.append(this.giveMeMoreDom,tips);
    }
    if(meGiveMoreUserData){
        var meGiveUserDom = dom.createByHTML('<div>' +
            '<img src="'+(meGiveMoreUserData.headUrl)+'" />' +
            ' <span title="'+(meGiveMoreUserData.userName)+'">'+(meGiveMoreUserData.userName)+'</span>' +
            '</div>');
        dom.append(this.meGiveMoreDom,meGiveUserDom);
    }
    else{
        var tips = dom.createByHTML('<span>妈妈说:不送魅力值给妹子，一辈子都会打光棍</span>');
        dom.append(this.meGiveMoreDom,tips);
    }
};
initRank.prototype.loadMyData = function(){
    var self = this;
    //获取我的魅力数 ，送我魅力数最多的人 ， 我送给魅力数最多的人
    util.ajax({
        url : '/getMyRankData',
        type : 'get',
        success : function(data){
            var result = JSON.parse(data),giveMeMoreUserData = null,meGiveMoreUserData = null;

            if(result['giveMeMoreUser']){
                giveMeMoreUserData = {
                    userName : result['giveMeMoreUser']['user_name'],
                    headUrl : '../../../../head/' + result['giveMeMoreUser']['head_url']
                };
            }
            if(result['meGiveMoreUser']){
                meGiveMoreUserData = {
                    userName : result['meGiveMoreUser']['user_name'],
                    headUrl : '../../../../head/' + result['meGiveMoreUser']['head_url']
                };
            }
            self.initMyData(result.charm_num,giveMeMoreUserData,meGiveMoreUserData);
        }
    });
};
initRank.prototype.update = function(){};

function initUser(parModal){
    this.parModal = parModal;
    this.loadAnimate = new loadAnimate(parModal.parentElement);
    this.loadUserData();
}
initUser.prototype.loadUserData = function(){
    var self = this;
    self.loadAnimate.show();
    util.ajax({
        url : '/getUserDataByEmail',
        type : 'post',
        data : {
            email : cache.get('email')
        },
        success : function(data){
            var result = JSON.parse(data);
            if(result.status === 200){
                var temp = result.data[0];
                self.userDataList = [{userColName: '头像',data:'../../../../head/' + temp['head_url']},
                    {userColName:'邮箱',data : temp['email']},
                    {userColName:'用户名称',data : temp['user_name']},
                    {userColName:'性别',data : temp['sex']},
                    {userColName:'金币数量',data : temp['gold_num']},
                    {userColName:'魅力值',data : temp['charm_num']},
                    {userColName:'吐槽值',data : temp['slots_num']}];
                self.initDom();
                self.loadAnimate.hide();
            }
            else if(result.status === 404){
                new toast({text : '用户数据为空'});
            }
            else{
                new toast({text : result.errorMs});
            }
        }
    });
};
initUser.prototype.initDom = function(){
    this.parModal.innerHTML = '';
    var userContainer = dom.createByHTML('<div class="userContainer"></div>');
    var userDataLeftCon = dom.createByHTML('<div class="userDataLeftCon"></div>');
    var userDataRightCon = dom.createByHTML('<div class="userDataRightCon"></div>');
    for(var i = 1,l = this.userDataList.length;i < l;i++){
        var temp = this.userDataList[i];
        var dataCon = dom.createByHTML('<div><span>'+(temp.userColName)+':</span><span>'+(temp.data)+'</span></div>');
        dom.append(userDataRightCon,dataCon);

    }
    dom.append(this.parModal,userContainer);
    dom.append(userContainer,userDataLeftCon);
    dom.append(userContainer,userDataRightCon);
    var headImg = dom.createByHTML('<img />');
    headImg.src = this.userDataList[0].data;
    var changeButton = dom.createByHTML('<button></button>');
    changeButton.innerText = '更换头像';
    var hideInputFile = dom.createByHTML('<input type="file" id="btn_file" style="display:none">');
    changeButton.addEventListener('click',function(e){
        document.getElementById("btn_file").click();
    });
    hideInputFile.addEventListener('change',function(e){
        if(typeof FileReader === 'undefined'){
            new toast({
                text : '对不起!您使用的浏览器不支持修改头像'
            });
        }
        else{
            var filereader = new FileReader();
            filereader.onload = function (event) {
                var srcpath = event.target.result;
                headImg.src =srcpath;
                var imgBlob = util.dataURLtoBlob(srcpath);
                var formData  = new FormData();
                formData.append("imgBlob",imgBlob);
                util.ajax({
                    url : 'changeUserHead',
                    type : 'post',
                    async:false,
                    data : formData,
                    contentType : true,
                    success : function(data){
                        var result = JSON.parse(data);
                        if(result.status === 200){
                            new toast({
                                text : '头像修改成功'
                            });
                        }
                        else if(result.status === 500){
                            new toast({
                                text : result.errorMsg
                            });
                        }
                        else{
                            new toast({
                                text : '网络问题，请刷新重试'
                            });
                        }
                    }
                });
            };
            filereader.readAsDataURL(this.files[0]);
        }
    });
    dom.append(userDataLeftCon,hideInputFile);
    dom.append(userDataLeftCon,headImg);
    dom.append(userDataLeftCon,changeButton)
};
initUser.prototype.update = function(){
    this.loadUserData();
};
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