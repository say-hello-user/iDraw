new share();
window.onload = function(){
    var img = new Image();
    img.src = './img/back.jpg';
    if(img.complete){
        dom.hide(dom.query('#loading'));
    }
    img.onload = function(){
        dom.hide(dom.query('#loading'));
    };
    var user = document.getElementById('user');
    var pass = document.getElementById('pass');
    var login = document.getElementById('login');
    var register = document.getElementById('register');
    register.onclick = function(){
        window.location.href= window.location.origin + '/registerPage';
    };
    login.onclick = function(){
        var typeRadio = document.getElementsByName('userType');
        var userType = null;
        for(var i=0,l = typeRadio.length; i < l;i++)  {
            if(typeRadio[i].checked)  {
                userType = typeRadio[i].value;
                break;
            }
        }
        if(userType === 'gameUser'){
            var rsa = util.rsaTranform(pass.value,JSEncrypt);
            util.ajax({
                url : '/login',
                type : 'post',
                data : {
                    email : user.value,
                    passWord : encodeURI(rsa).replace(/\+/g,'%2B')
                },
                success : function(data){
                    var email = dom.query('[name="email"]');
                    if(data === '登陆成功'){
                        window.location.href= window.location.origin + '/selectServerPage';
                        delete email.parentElement.dataset;
                    }
                    else{
                        email.parentElement.dataset.errorMsg = '\ue7bd'+data;
                        email.parentElement.classList.add('errMsg');
                    }
                }
            });
        }
        else if(util.isPc()){
            if(user.value === 'admin' && pass.value === 'admin'){
                window.location.href= 'http://' + window.location.hostname + ':4000';
            }
            else{
                var email = dom.query('[name="email"]');
                email.parentElement.dataset.errorMsg = '\ue7bd管理员用户名或者密码错误';
                email.parentElement.classList.add('errMsg');
            }
        }
        else{
            var email = dom.query('[name="email"]');
            email.parentElement.dataset.errorMsg = '\ue7bd对不起,后台暂不支持移动端';
            email.parentElement.classList.add('errMsg');
        }
    }
};