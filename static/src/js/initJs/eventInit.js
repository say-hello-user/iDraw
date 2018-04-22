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