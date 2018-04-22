var log4js = require("log4js");
var path = require('path');
/**
 * 日志配置
 */
module.exports.configure = function() {
    log4js.configure({
        appenders: {
            iPaint: {
                type: 'dateFile',
                filename: path.resolve(__dirname, '..') + '/logs/iPaint.log',
                pattern: 'yyyy-MM-dd-hh',
                compress: true
            }
        },
        categories: {
            default: {
                appenders: ['iPaint'],
                level: 'trace'
            }
        },
        pm2: true,
        replaceConsole: true
    })
};

/**
 * 暴露到应用的日志接口，调用该方法前必须确保已经configure过
 * @param name 指定log4js配置文件中的category。依此找到对应的appender。
 *              如果appender没有写上category，则为默认的category。可以有多个
 * @returns {Logger}
 */
module.exports.logger = function(name) {
    return log4js.getLogger(name);
};

/**
 * 用于express中间件，调用该方法前必须确保已经configure过
 * @returns {Function|*}
 */
module.exports.useLog = function(name) {
    return log4js.connectLogger(log4js.getLogger(name), {level: log4js.levels.INFO});
};