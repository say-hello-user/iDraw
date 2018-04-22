//通用函数封装
var util = {
	ajax : function(obj){
			    obj.type = obj.type || "get";
			  obj.async = obj.async || true;
			  obj.data = obj.data || null;
			  if (window.XMLHttpRequest){//非ie
			    var ajax = new XMLHttpRequest();
			  }
			  else{ //ie 
			    var ajax = new ActiveXObject("Microsoft.XMLHTTP");
			  }
			  //区分get和post
			  if (obj.type == "post"){
			    ajax.open(obj.type,obj.url,obj.async);
                   !obj.contentType && ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			    var data = obj.data instanceof FormData ? obj.data : util.toData(obj.data);
			    ajax.send(data);
			  }else{
			    var url = obj.url+"?"+util.toData(obj.data);
			    ajax.open(obj.type,url,obj.async);
			    ajax.send();
			  }
			 
			  ajax.onreadystatechange = function (){
			    if (ajax.readyState == 4){
			        if (ajax.status>=200&&ajax.status<300 || ajax.status==304){
			          if (obj.success){
			            obj.success(ajax.responseText);
			          }
			        }else{
			          if (obj.error){
			            obj.error(ajax.status);
			          }
			        }
			      }
			   }  
	},
	toData : function(obj){
		  if (obj == null){
		    return obj;
		  }
		  var arr = [];
		  for (var i in obj){
		    var str = i+"="+obj[i];
		    arr.push(str);
		  }
		  return arr.join("&");
	},
    isPc : function() {
	    var userAgentInfo = navigator.userAgent;
	    var Agents = ["Android", "iPhone",
	                "SymbianOS", "Windows Phone",
	                "iPad", "iPod"];
	    var flag = true;
	    for (var v = 0; v < Agents.length; v++) {
	        if (userAgentInfo.indexOf(Agents[v]) > 0) {
	            flag = false;
	            break;
	        }
	    }
	    return flag;
	},
	countDown : function(src,startCb,stopCb){
        var worker = null;
		function startWorker(){
            if(typeof Worker!=="undefined")
            {
                if(worker === null)
                {
                    worker = new Worker(src);
                }
                worker.onmessage = function (event) {
                    startCb(event);
                };
            }
            else
            {
                time.innerHTML="Sorry, your browserdoes not support Web Workers...";
            }
		}
        function stopWorker()
        {
            worker.terminate();
            stopCb && stopCb();
        }
        function getWorker(){
			return worker;
		}
        return {
            startWorker : startWorker,
            stopWorker : stopWorker,
            getWorker : getWorker
		}
	},
    randomColor : function(){
        var r=Math.floor(Math.random()*256);
        var g=Math.floor(Math.random()*256);
        var b=Math.floor(Math.random()*256);
        return "rgb("+r+','+g+','+b+")";
    },
    dataURLtoBlob : function(url){
        var arr = url.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
	},
	rsaTranform : function(text,JSEncrypt){
        var publicPem = '-----BEGIN PUBLIC KEY-----' +
            'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMzli1vbwDGBmk5vPIPN3lLZBhgZY/dC' +
            'GzY0de/bkBQGtwmB4fcuBav4bjbEPL5mBtfPOro50PYU+w4eEMX8U+sCAwEAAQ==' +
            '-----END PUBLIC KEY-----';
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicPem);
        var encrypted = encrypt.encrypt(text);
        return encrypted.toString();
	},
	URLencode : function(sStr) {

		return decodeURI(sStr).replace(/\+/g, '%2B').replace(/\"/g,'%22').replace(/\'/g, '%27').replace(/\//g,'%2F');

	},
    myBrowser : function(){ //判断浏览器类型
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        if (isOpera) {
            return "Opera"
        }; //判断是否Opera浏览器
        if (userAgent.indexOf("Firefox") > -1) {
            return "FF";
        } //判断是否Firefox浏览器
        if (userAgent.indexOf("Chrome") > -1){
            return "Chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } //判断是否Safari浏览器
        if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            return "IE";
        }; //判断是否IE浏览器
        if (userAgent.indexOf("Trident") > -1) {
            return "Edge";
        } //判断是否Edge浏览器
	}
};

//canvas操作封装
var canvasUtil = {
	    drawPts: function (canvas,ctx,pts) { //根据后台传过来的图形轨迹画图
	        if(pts instanceof Path || pts.pts){
	            var color = pts.color,lw = pts.lw;
	            pts = pts.pts;
	        }
	        var p1 = pts[0];
	        ctx.save();
	        ctx.beginPath();
	        ctx.moveTo(p1.x, p1.y);
	        pts.slice(1).forEach(function(v){
	            ctx.lineTo(v.x,v.y);
	        });
	        ctx.lineWidth = lw || canvas.lw;
	        ctx.strokeStyle = color || canvas.color;
	        ctx.stroke();
	        ctx.restore();
	    },
	    init : function (canvas) { //初始化canvas属性
	        canvas.paths=[];
	        canvas.pts=[];
	        canvas.color = 'black';
	        canvas.lw = 1;
	    },
	    setLw : function(canvas,lw){
	        canvas.lw = lw;
	    },
	    setColor : function(canvas,c){
	        canvas.color = c;
	    },
	    addPath : function (canvas,pts) {
	        canvas.paths.push(new Path(pts,canvas.lw,canvas.color));
	    },
	    addPos : function (canvas,x,y) {
	        canvas.pts.push(new Pos(x,y));
	    },
	    clearPos : function (canvas) {
	        canvas.pts = []
	    },
	    clearPaint : function(ctx,canvas){
	    	ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);  
	    },
	    canvasToPng : function(canvas,imgArr,cb){
	    	var url =  canvas.toDataURL("image/png");
            imgArr && imgArr.push(url);
            cb(url);
		}
};

//dom操作封装
var dom = {
    createByHTML : function(html){
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
	},
    remove : function(node) {
        if (node) {
            node.parentNode && node.parentNode.removeChild(node);
        }
    },
    queryAll : function(selector,parent){
    	return parent ? parent.querySelectorAll(selector) : document.querySelectorAll(selector);
     },
    query : function(selector,parent){
   		 return parent ? parent.querySelector(selector) : document.querySelector(selector);
     },
    /**
	 * 显示节点
     * @param dom
     */
	show : function(dom){
    	dom.classList.remove('hide');
    	dom.classList.add('show');
	},
    /**
	 *隐藏节点
     * @param dom
     */
	hide : function(dom){
        dom.classList.remove('show');
        dom.classList.add('hide');
	},
    /**
     * 往父元素最后附加一个元素
     * @param {Element} parent
     * @param {Node | string} child
     */
    append :function(parent, child) {
		if(typeof child === 'string'){
			child = document.createTextNode(child);
		}
		parent.appendChild(child);
	},
    /**
     * 往父元素第一个位置插入一个元素
     * @param {Element} parent
     * @param {Node | string} child
     */
	prepend : function(parent, child) {
		if(typeof child === 'string'){
			child = document.createTextNode(child);
		}
		parent.insertBefore(child, parent.firstElementChild)
	},
	/**
	 * 在某个元素之前插入一个元素
	 * @param {Element} ref
	 * @param {Node | string} el
	 */
	before : function(ref, el) {
		if(typeof el === 'string'){
			el = document.createTextNode(el);
		}
		ref.parentNode.insertBefore(el, ref);
	},
	/**
	 * 在某个元素之后插入一个元素
	 * @param {Element} ref
	 * @param {Node | string} el
	 */
	after : function(ref, el) {
		if(typeof el === 'string'){
			el = document.createTextNode(el);
		}
		ref.parentNode.insertBefore(el, ref.nextElementSibling);
	},
    /**
     * 一个元素是否匹配一个css选择器
     * @param {Element} dom
     * @param {string} selector
     * @return {boolean}
     */
    matches : function(dom, selector) {
		if ('matches' in dom) {

			return dom.matches(selector);
			// }else if('matchesSelector' in dom){
			// 兼容老版本浏览器
			// return dom.matches(selector);
		} else if ('webkitMatchesSelector' in dom) {
			// 兼容android 4.4
			return dom.webkitMatchesSelector(selector);
		} else {
			return false;
		}
    },
    /**
     * 向上冒泡遍历查找与能与css选择器匹配的元素(包含自身),
     * @param {HTMLElement} target
     * @param {string} selector
     * @return {HTMLElement}
     */
    closest: function (target, selector) {
		var tar = target;
		while (tar) {
			if (dom.matches(tar, selector)) {
				return tar;
			}
			tar = tar.parentElement;
		}
		return null;
    }
};

//本地缓存封装
var cache = {
	add : function(key,value){
		localStorage.setItem(key,JSON.stringify(value));
	},
	get : function(key){
		return JSON.parse(localStorage.getItem(key));
	},
	remove : function(key){
        localStorage.removeItem(key);
    },
	clear : function(){
        localStorage.clear();
	}
};


var socketStatus = {
	myLoading : null,
	init : function(socket){
        socket.on('error', function(data){
        	if(socketStatus.myLoading){
                socketStatus.myLoading.show();
                socketStatus.myLoading.setText('socket错误' + data);
			}
			else{
                socketStatus.myLoading = new loading({text : 'socket错误' + data});
			}
        });
        socket.on('disconnect', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('与服务器断开了连接') : (socketStatus.myLoading = new loading({text : '与服务器断开了连接'}));
        });
        socket.on('reconnect_attempt', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('尝试第'+ data+'次重连') : (socketStatus.myLoading =new loading({text : '尝试第'+ data+'次重连'}));
        });
        socket.on('reconnecting', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('正在重连...') : (socketStatus.myLoading = new loading({text : '正在重连...'}));
        });
        socket.on('reconnect', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('重连成功') : (socketStatus.myLoading = new loading({text : '重连成功'}));
        });

        socket.on('connect_error', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('连接错误') : (socketStatus.myLoading = new loading({text : '连接错误'}));
        });
        socket.on('reconnect_error', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('重连错误') : (socketStatus.myLoading = new loading({text : '重连错误'}));
        });
        socket.on('connect_timeout', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('连接超时') : (socketStatus.myLoading = new loading({text : '连接超时'}));
        });

        socket.on('reconnect_failed', function(data){
            socketStatus.myLoading ? socketStatus.myLoading.setText('重连失败,请重新登陆') : (socketStatus.myLoading = new loading({text : '重连失败,请重新登陆'}));
        });
	}
};
