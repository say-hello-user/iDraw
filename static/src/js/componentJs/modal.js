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