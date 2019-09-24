const http = require('http');
const fs = require('fs');
// 引入Node系統預設物件放入常數

const server = http.createServer((request,response)=>{
    fs.writeFile(__dirname + '/header01.json',
        JSON.stringify(request.headers),
        error => {
            console.log("save ok");
        }
    );

    fs.readFile(__dirname + '/data01.html',(error,data)=>{
        // 讀data01的資料
        if(error) {
            response.writeHead(500,{ 'Content-Type': 'text/plain'});
            response.end('500 - data01.html not found');
        }else{
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end(data);
        }
    })
    /*
    // __dirname父曾資料夾路徑
    response.writeHead(200,{
        'Content-Type': 'text/html'
    });
    response.end(`<h2>Hello${request.url}</h2>`);
    */
});

server.listen(3000); 
// 監聽port號/通常使用3000/5000
// 可以利用不同port號來執行多個server