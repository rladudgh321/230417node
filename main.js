const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const template = require('./lib/template');
const sanitizeHtml = require('sanitize-html');
const cookie = require('cookie');
const auth = require('./lib/auth');

const app = http.createServer((request,response)=>{
    const dd = url.parse(request.url,true); 
    // console.log(dd);
    const queryData = url.parse(request.url,true).query;
    const pathname = url.parse(request.url,true).pathname;
    

    

    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readdir(`./data`,(error, filelist)=>{
                const list = template.List(filelist);
                const title = 'welcome';
                const description = 'nodejs!!!';
                const html = template.HTML(title, list, description,
                `<a href="/create">create</a>`,
                auth.statusUI(request,response)
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            const title = queryData.id;
            fs.readdir(`./data`,(error, filelist)=>{
                const list = template.List(filelist);
                const filteredId = path.parse(queryData.id).base;
                fs.readFile(`./data/${filteredId}`,'utf-8',(error,description)=>{
                const html = template.HTML(sanitizeHtml(title), list, sanitizeHtml(description),
                    `<a href="/create">create</a>
                    <a href="/update?id=${queryData.id}">update</a>
                    <form action="/delete_process" method="post">
                        <input type="hidden" name="id" value="${queryData.id}">
                        <input type="submit" value="delete">
                    </form>`, auth.statusUI(request,response)
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        if(!auth.isOwner(request,response)){
            response.end('login required');
            return false;
        }
        fs.readdir(`./data`,(error, filelist)=>{
            const list = template.List(filelist);
            const title = 'CREATE';
            const html = template.HTML(title, list, '',`
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit" value="create"></p>
            </form>
            `, auth.statusUI(request,response));
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname=== '/create_process'){
        if(!auth.isOwner(request,response)){
            response.end('login required');
            return false;
        }
        let body = '';
        request.on('data', data =>{
            body += data; 
        });
        request.on('end',()=>{
            const post = qs.parse(body);
            const title = post.title;
            const description = post.description;
            const filteredtitle = path.parse(title).base;
            fs.writeFile(`./data/${filteredtitle}`,description,`utf-8`,(error)=>{
                response.writeHead(302,{Location:`/?id=${title}`});
                response.end();
            });
        });
    } else if(pathname===`/update`){
        if(!auth.isOwner(request,response)){
            response.end('login required');
            return false;
        }
        fs.readdir(`./data`,(error, filelist)=>{
            const list = template.List(filelist);
            const filteredId = path.parse(queryData.id).base;
            fs.readFile(`./data/${filteredId}`,'utf-8',(error,description)=>{
                const title = 'UPDATE';
                const html = template.HTML(title, list, '',`
                <form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(queryData.id)}"></p>
                    <p><textarea name="description" placeholder="description">${sanitizeHtml(description)}</textarea></p>
                    <p><input type="submit" value="update"></p>
                </form>`, auth.statusUI(request,response)
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
        if(!auth.isOwner(request,response)){
            response.end('login required');
            return false;
        }
        let body = '';
        request.on('data', data =>{
            body += data; 
        });
        request.on('end',()=>{
            const post = qs.parse(body);
            const id = post.id;
            const title = post.title;
            const description = post.description;
            const filteredId = path.parse(id).base;
            const filteredtitle = path.parse(title).base;
            fs.rename(`./data/${filteredId}`,`./data/${filteredtitle}`,error=>{
                fs.writeFile(`./data/${filteredtitle}`,description,`utf-8`,(error)=>{
                    response.writeHead(302,{Location:`/?id=${title}`});
                    response.end();
                });
            });
        });
    } else if(pathname === '/delete_process'){
        if(!auth.isOwner(request,response)){
            response.end('login required');
            return false;
        }
        let body = '';
        request.on('data', data =>{
            body += data; 
        });
        request.on('end',()=>{
            const post = qs.parse(body);
            const id = post.id;
            const filteredId = path.parse(id).base;
            fs.unlink(`./data/${filteredId}`,(error)=>{
                response.writeHead(302,{Location:`/`});
                response.end();
            });
        });
    } else if(pathname === '/login'){
        fs.readdir(`./data`,(error, filelist)=>{
            const title = 'LOG IN';
            const list = template.List(filelist);
            const html = template.HTML(title, list, '',`
            <form action="/login_process" method="post">
                <p><input type="text" name="email" placeholder="email"></p>
                <p><input type="password" name="pwd" placeholder="password"></p>
                <p><input type="submit" value="login"></p>
            </form>
            `, auth.statusUI(request,response));
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/login_process'){
        let body = '';
        request.on('data', data =>{
            body += data; 
        });
        request.on('end',()=>{
            const post = qs.parse(body);
            const email = post.email;
            const password = post.pwd;
            if(email === "egoing777@gmail.com" && password === "111111"){
                response.writeHead(302,{
                    Location:`/`,
                    'set-cookie' : [
                        `email= ${email}`,
                        `password= ${password}`,
                        `nickname= egoing`
                    ]
                });
                response.end();
            } else {
                response.end('who?');
            }
        });
    } else if(pathname === '/logout'){
        if(!auth.isOwner(request,response)){
            response.end('login required');
            return false;
        }
        response.writeHead(302,{
            Location:`/`,
            'set-cookie' : [
                `email=; Max-Age=0`,
                `password=; Max-Age=0`,
                `nickname=; Max-Age=0`
            ]
        });
        response.end();
    } else {
        response.writeHead(404);
        response.end('notFOUND');
    }
}).listen(3000);