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