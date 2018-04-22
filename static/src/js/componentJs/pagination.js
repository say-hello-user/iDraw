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