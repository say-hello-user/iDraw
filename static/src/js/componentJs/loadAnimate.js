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
