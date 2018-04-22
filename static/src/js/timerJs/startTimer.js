/**
 * 玩家用户全部准备之后游戏开始倒计时计时器
 * @type {number}
 */
var i= 3;
function timedCount()
{
i--;
postMessage(i);
setTimeout("timedCount()",1000);
}

timedCount();