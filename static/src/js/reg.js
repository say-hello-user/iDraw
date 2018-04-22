var container = document.getElementById("container");
function preview(file) {
    container.innerHTML = "";
    if (window.FileReader) {
        for (var index=0, f; f = file.files[index]; index++) {
            var filereader = new FileReader();
            filereader.onload = function (event) {
                var srcpath = event.target.result;
                showPreviewImage(srcpath);
            };
            filereader.readAsDataURL(f);
        }
    } else {
        if (!/\.jpg$|\.png$|\.gif$/i.test(file.value)) {
            console.log("原生"+msg);
        } else {
            showPreviewImage(file.value);
        }
    }
}

function showPreviewImage(src) {
    var img = document.createElement('img');
    img.src = src;
    img.classList.add('previewAvator');
    container.appendChild(img);
}

function valid(curDom,type){
    switch(type){
        case 'passWord':
            var value = curDom.value;
            var reg = valid.regex[type]['reg'];
            if(!reg.test(value)){
                curDom.classList.add('validErr');
                curDom.parentElement.classList.add('errMsg');
                curDom.parentElement.dataset.errorMsg = valid.regex[type]['errorMsg'];
            }
            else{
                curDom.classList.remove('validErr');
                curDom.parentElement.classList.remove('errMsg');
                delete curDom.parentElement.dataset.errorMsg;
            }
            reg.lastIndex = 0;
            var againPass = dom.query('[name="againPass"]');
            if(againPass.value === curDom.value){
                againPass.classList.remove('validErr');
                againPass.parentElement.classList.remove('errMsg');
                delete againPass.parentElement.dataset.errorMsg;
            }
            if(againPass.value !== ""){
                againPass.classList.add('validErr');
                againPass.parentElement.classList.add('errMsg');
                againPass.parentElement.dataset.errorMsg = '\ue7bd两次密码不一致,请重新输入';
                }
            break;
        case 'userName':
            if(curDom.value !== ''){
                curDom.classList.remove('validErr');
                curDom.parentElement.classList.remove('errMsg');
                delete curDom.parentElement.dataset.errorMsg;
            }
            break;
        case 'againPass':
            var passWordVal = dom.query('[name="password"]').value;
            if(passWordVal !== curDom.value){
                curDom.classList.add('validErr');
                curDom.parentElement.classList.add('errMsg');
                curDom.parentElement.dataset.errorMsg = '\ue7bd两次密码不一致,请重新输入';
            }
            else{
                curDom.classList.remove('validErr');
                curDom.parentElement.classList.remove('errMsg');
                delete curDom.parentElement.dataset.errorMsg;
            }
            break;
    }
    if(type === 'email' && !curDom.dataset.errorMsg && curDom.value !== ''){
        util.ajax({
            url : '/getUserDataByEmail',
            type : 'post',
            data : {
                email : curDom.value
            },
            success : function(data){
                var result = JSON.parse(data);
                if(result.status === 200){
                    curDom.classList.add('validErr');
                    curDom.parentElement.classList.add('errMsg');
                    curDom.parentElement.dataset.errorMsg = '该邮箱已经注册';
                }
                else{
                    curDom.classList.remove('validErr');
                    curDom.parentElement.classList.remove('errMsg');
                    delete curDom.parentElement.dataset.errorMsg;
                    var value = curDom.value;
                    var reg = valid.regex[type]['reg'];
                    if(!reg.test(value)){
                        curDom.classList.add('validErr');
                        curDom.parentElement.classList.add('errMsg');
                        curDom.parentElement.dataset.errorMsg = valid.regex[type]['errorMsg'];
                    }
                    else{
                        curDom.classList.remove('validErr');
                        curDom.parentElement.classList.remove('errMsg');
                        delete curDom.parentElement.dataset.errorMsg;
                    }
                    reg.lastIndex = 0;
                }
            }
        });
    }
}

valid.regex = {
    email : {reg : /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g , errorMsg : '\ue7bd邮箱格式错误'},
    passWord : {reg : /^([0-9A-Za-z]+)/g, errorMsg : '\ue7bd密码只支持数字，字母格式'}
};

dom.query('form').addEventListener('submit',function(e){
    var inputDom = dom.queryAll('form > div > input');
    var hasAllVal = true,
        hasError = false;
    for(var i = 0,l = inputDom.length;i  < l;i++){
        if(inputDom[i].value === ""){
            hasAllVal = false;
            inputDom[i].classList.add('validErr');
            inputDom[i].parentElement.classList.add('errMsg');
            inputDom[i].parentElement.dataset.errorMsg = '\ue7bd此项不能为空';
        }
        if(inputDom[i].parentElement.dataset.errorMsg){
            hasError = true;
        }
    }
    if(hasError || !hasAllVal){
        e.preventDefault();
    }
    if(hasAllVal){
        var rasResult = util.rsaTranform(inputDom[2].value,JSEncrypt);
        inputDom[2].value = rasResult;
        inputDom[3].value = rasResult;
    }
});

window.onload = function(){
    var img = new Image();
    img.src = './img/back.jpg';
    img.onload = function(){
        dom.hide(dom.query('#loading'));
    };
};