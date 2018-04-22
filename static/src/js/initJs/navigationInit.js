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