var commonUtil = {
    /**
     * 判断是否为移动端请求
     * @param req
     * @returns {Array|{index: number, input: string}}
     */
    isMb : function(req){
        var deviceAgent = req.headers['user-agent'].toLowerCase();
        var agentID = deviceAgent.match(/(iphone|ipod|ipad|android|symbianos|windows phone)/);
        return agentID;
    }
};

module.exports = commonUtil;