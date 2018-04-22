var socketUtil = {
    //用来获取传入socket集合与用户有关的一些基本信息
    getCurSocketData : function(socket){
        return {
            userName : socket.userName ? socket.userName : null, //当前socket的用户姓名
            roomId : socket.roomId ? socket.roomId : null,//当前socket的房间号
            isReady : socket.isReady ? socket.isReady : null,//当前socket的准备状态
            nsp : socket.nsp.name.slice(1) ? socket.nsp.name.slice(1) : 'server1', //当前socket的命名空间
            score : socket.score ? socket.score : 0,//存储当前socket当前获得的分数
            answerRight : socket.answerRight ? 1 : 0, //存储当前socket在本回合是否已经回答正确 0（还未回答正确） 1（已经回答正确）
            email : socket.email ? socket.email : null
        }
    },
    //设置当前socket某些用户信息 data {}
    setCurSocketData : function(scoket,data){
        for(var key in data){
            scoket[key] = data[key];
        }
    },
    //内部调用 用来获取io命名空间下roomId房间内所有的socket集合
    getCurRoomSocket : function(io,roomId){
        if(io.adapter.rooms[roomId]){
            var clients = io.adapter.rooms[roomId].sockets; //获取改房间内所有socketId
            var sockets =  io.sockets;  //改命名空间下所有socket对象
            var allSockets = [];
            //根据socketId获取当前socket对象
            for (var clientId in clients ) {
                allSockets.push(sockets[clientId]);
            }
            return allSockets;
        }
        else{
            return false;
        }
    },
    getSocketByEmail : function(io,roomId,email){
        var roomSocket = socketUtil.getCurRoomSocket(io,roomId);
        for(var i = 0,l = roomSocket.length;i < l;i++){
            if(roomSocket[i].email === email){
                return roomSocket[i];
            }
        }
    },
    getIoSocketByEmail : function(io,email){
        var allSockets = io.sockets.sockets;
        //根据socketId获取当前socket对象
        for (var clientId in allSockets) {
            var temp = allSockets[clientId];
            if(temp['email'] === '"' + email + '"'){
                return temp;
            }
        }
    },
    getRoomUserScore : function(io,roomId){
        var roomSocket = socketUtil.getCurRoomSocket(io,roomId);
        var score = [];
        for(var i = 0,l = roomSocket.length;i < l;i++){
            score.push({
                userName : roomSocket[i].userName,
                score : roomSocket[i].score
            });
        }
        return score;
    }
};

module.exports = socketUtil;