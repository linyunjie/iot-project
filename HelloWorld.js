//引用'http'模組
const http = require('http');



//新增一個server並指定他的頁面資訊，內容為'Hello World!'
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!\n');
});


