/**
 * 游戏回合玩家作画倒计时计时器
 * @type {{timeLeft: number}}
 */
var timeCount = {
    timeLeft : 60
};
function timedCount()
{
    timeCount.timeLeft--;
    postMessage(timeCount);
    setTimeout("timedCount()",1000);
}

timedCount();

//当主线程发来信息后，触发该message事件
onmessage = function(event){
    timeCount.timeLeft += event.data;
};