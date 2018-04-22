//点信息
function Pos(x,y) {
    this.x=x;
    this.y=y;
}
//路径信息
function Path(pts,lw,color) {
    this.pts = pts;
    this.lw = lw || canvas.lw;
    this.color = color || canvas.color;
}
//擦除区域
function Rect(x,y,w,h) {
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
}

//清空部分画布方法
Rect.prototype.clearOn = function (ctx) {
    ctx.clearRect(this.x,this.y,this.w,this.h);
};
//绘制矩形方法
Rect.prototype.drawRect = function(ctx){
    ctx.strokeRect(this.x,this.y,this.w,this.h);
};