/**
 * 游戏过程中关键词提示计时器
 * @type {number}
 */
var i= 18;//十八秒提示三次  每六秒提示一次与关键词相关的提示
function timedCount()
{
    i--;
    postMessage(i);
    setTimeout("timedCount()",1000);
}

timedCount();