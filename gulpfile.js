// 引入 gulp及组件
var gulp=require('gulp'),  //gulp基础库
    plumber = require('gulp-plumber'),//防止编译报错自动终端gulp任务
    minifycss=require('gulp-minify-css'),   //css压缩
    concat=require('gulp-concat'),   //合并文件
    uglify=require('gulp-uglify'),   //js压缩
    rename=require('gulp-rename');   //文件重命名

gulp.task('default',function(){
    gulp.start(['minifyMainjs','minifyLoadCssjs','minifyPcCss','minifyMbCss','minifyLogCss']);
    try {
        //监视js文件修改
        gulp.watch('./static/src/js/**/*.js', ['minifyMainjs','minifyLoadCssjs']);
        //监视css文件修改
        gulp.watch('./static/src/css/common/*.css', ['minifyPcCss','minifyMbCss']);
        gulp.watch('./static/src/css/pc/*.css', ['minifyPcCss']);
        gulp.watch('./static/src/css/mb/*.css', ['minifyMbCss']);
        gulp.watch('./static/src/css/logReg.css', ['minifyLogCss']);
        throw "error";
    }
    catch(err){
       console.log(err);
    }

});

var watchFile = {
    loadCssjs : ['./static/src/js/utilJs/util.js',
        './static/src/js/loadCssFile.js'
    ],
    mainJs : ['./static/src/js/componentJs/*.js',
        './static/src/js/initJs/*.js',
        './static/src/js/socketJs/reactSocket.js',
        './static/src/js/socketJs/clientSocket.js'],
    pcCss : ['./static/src/css/common/*.css','./static/src/css/pc/*.css'],
    mbCss : ['./static/src/css/common/*.css','./static/src/css/mb/*.css'],
    logCss : ['./static/src/css/common/*.css','./static/src/css/logReg.css']
};

//合并主页面预加载js
genGulpTask('minifyLoadCssjs',watchFile.loadCssjs,'loadCss.js','js');
//合并主页面主JS文件
genGulpTask('minifyMainjs',watchFile.mainJs,'paint.js','js');
//pcCss处理任务
genGulpTask('minifyPcCss',watchFile.pcCss,'paint.pc.css','css');
//mbCss处理任务
genGulpTask('minifyMbCss',watchFile.mbCss,'paint.mb.css','css');
//合并注册登录界面css文件
genGulpTask('minifyLogCss',watchFile.logCss,'paint.log.css','css');

function genGulpTask(taskName,watchFile,minifyFileName,dir){
    gulp.task(taskName,function(err){
            return gulp.src(watchFile) //选择合并的JS
                .pipe(plumber())
                .pipe(concat(minifyFileName))                                 //合并
                .pipe(gulp.dest('static/dist/'+dir))                           //输出
                .pipe(rename({suffix:'.min'}))                               //重命名
                .pipe(dir === 'js'? uglify() : minifycss())                                              //压缩
                .pipe(gulp.dest('static/dist.min/'+dir))                       //输出
    });
}
