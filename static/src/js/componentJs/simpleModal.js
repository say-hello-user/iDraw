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