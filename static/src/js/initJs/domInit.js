(function(){
    window.pDom = { };
    window.domInit = function(){
        this.pDom = {
            pen : dom.query('#pen'), //铅笔
            erase : dom.query('#erase'),//橡皮擦
            clear : dom.query('#clear'),//清空画布
            myColor : dom.query('#myColor'),//画笔颜色选择器
            penWidth : dom.query('#penWidth'),//画笔粗细选择器
            addTime : dom.query('#addTime'),//增加本轮作画时间
            changeWord : dom.query('#changeWord'),//更改本回合自己的关键字
            gameCenter : dom.query('#gameCenter'),//游戏中心界面
            roomClose : dom.query('#roomClose'),//离开房间按钮
            loading : dom.query('#loading'),//加载效果
            currentSer : dom.query('#currentSer'),//显示当前大区节点
            selectRoom : dom.query('#selectRoom'),//选择房间节点
            header : dom.query('#header'),//头部节点
            ready : dom.query('#ready'),//准备按钮
            readyText : dom.query('.gc-top-text',pDom.ready),//准备文本
            lock : dom.query('#lock'),//房间加锁按钮
            sendInvate : dom.query('#sendInvate'),//发送游戏邀请
            paintMain : dom.query('#paintMain'),//canvas界面dom
            userList : dom.query('#userList'),//用户准备界面dom
            leftTime : dom.query('#leftTime'),//剩余时间dom
            curData : dom.query('.cur-data'),
            keyWord : dom.query('#keyWord',pDom.curData),//关键字
            showDraw : dom.query('#showDraw'),//显示当前绘画结果
            back : dom.query('#back'),//遮罩
            topMenu : dom.query('.top-menu'),//移动端顶部菜单按钮
            message : dom.query('#message'),
            sendInput : dom.query('.sendInput',pDom.message),
            send : dom.query('.send',pDom.message),
            gameUser : dom.query('#gameUser'),
            msgList : dom.query('#msgList'),
            drawUtil : dom.query('.draw-util')
        };
    };
})();