const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const template = require('./lib/template');
const sanitizeHtml = require('sanitize-html');

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
                `<a href="/create">create</a>`
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
                    </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        fs.readdir(`./data`,(error, filelist)=>{
            const list = template.List(filelist);
            const title = 'CREATE';
            const html = template.HTML(title, list, '',`
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit" value="create"></p>
            </form>
            `);
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname=== '/create_process'){
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
                </form>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
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
    } else {
        response.writeHead(404);
        response.end('notFOUND');
    }
}).listen(3000);