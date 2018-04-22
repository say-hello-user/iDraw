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