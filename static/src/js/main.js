var clientSocket = clientSocket();
var imgLoaded = false;//用来判断图片是否预加载完毕
function imgLoad(imgList){
    if(imgList instanceof Array){
        var num = 0;
        for(var i = 0,l = imgList.length;i < l;i++){
            var img = new Image();
            img.src = imgList[i];
            if(img.complete){
                num++;
                if(num === imgList.length){
                    imgLoaded = true;
                    dom.hide(pDom.loading);
                }
            }
            img.onload = function(){
                num++;
                if(num === imgList.length){
                    imgLoaded = true;
                    dom.hide(pDom.loading);
                }
            };
        }
    }
}

new share();//初始化分享插件
 window.onload = function () {
     domInit();
     socketInit();
	 canvasUtil.init(canvas);
     eventInit();
     imgLoad(['./img/back.jpg','./img/border2.png']);

	 pDom.currentSer.innerHTML = '当前服务区:iDraw' + (cache.get('serverName') === 'server1' ? '一区' : '二区');

	 if(!util.isPc()){
		canvas.width = document.body.clientWidth;
		canvas.style.width = document.body.clientWidth + 'px';
		canvas.height = document.body.clientHeight - 200;
		canvas.style.height = (document.body.clientHeight - 200) + 'px';
	 }
     ctx.fillStyle = '#FFFFFF';
     ctx.fillRect(0, 0, canvas.width, canvas.height);
};