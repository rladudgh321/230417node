const cookie = require('cookie');


module.exports = {
    isOwner : function (request,response){
        let isowner = false;
        let cookies = {}
        if(request.headers.cookie){
            cookies = cookie.parse(request.headers.cookie);
        }
        if(cookies.email === 'egoing777@gmail.com' && cookies.password === '111111'){
            isowner = true;
        }
        return isowner;
    },
    statusUI : function (request,response){
        let UI = `<a href="/login">login</a>`;
        if(this.isOwner(request,response)){
            UI = `<a href="/logout">logout</a>`;
        }
        return UI;
    }

}