// const Person = require('./person');
// 引入來源檔案export 放入const Person
// const p1 = new Person('Bill', 25);
// 建立新的物件，參數為('Bill', 25)
// const p2 = new Person;
// console.log(p1.toJSON());
// 物件p1使用toJSON方法(來源檔案設定的方法)
// console.log(p2.toJSON());

// const f = require('./index');
// console.log(f(10));

const http = require('http');
const server = http.createServer((request,response)=>{
    response.writeHead(200,{
        'Content-Type': 'text/html'
    });
    response.end(`<h2>${request.url}</h2>`);
});

server.listen(3000); 
// 監聽port號/通常使用3000/5000
// 可以利用不同port號來執行多個server