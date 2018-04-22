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