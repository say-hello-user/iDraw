
//前端动态加载css
function cssInit(){
    var head = document.getElementsByTagName('head')[0];

    var init = function(src){
        var linkTag = document.createElement('link');
        linkTag.href = src;
        linkTag.setAttribute('rel','stylesheet');
        linkTag.setAttribute('media','all');
        linkTag.setAttribute('type','text/css');
        head.appendChild(linkTag);
    };
    //判断是否为pc 加载pc
    if(util.isPc()){
        init('./dist.min/css/paint.pc.min.css');
    }
    //加载移动
    else{
        init('./dist.min/css/paint.mb.min.css');
    }
}
cssInit();