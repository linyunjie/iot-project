company = null;
var express = require('express');
var app = express();
var pg = require('pg');
var moment = require('moment');
var linebot = require('linebot');
const isset = require('isset');
var empty = require('is-empty');
var check = require('check-types');
var net = require('net'); // 引入網路 (Net) 模組
var HOST = '59.127.58.16';
var PORT = 10090;
require('dotenv').config();

console.log(process.env.CHRIS); //chris


var bot = linebot({
  channelId: '1653596866',
  channelSecret: '23f49e04f290f01d7960086188bff0d3',
  channelAccessToken: 'YW+v70OLwnVOIipHZIDMY2QS6JZkIYIxdXbNJwgaet4rR8Isb3Nqa6pP0hf6UPG035RSx39XMG31FERr655oKd1ab2600LzMgKwfLhGZGQ7XM1hZUUam0vNfgIPwsQVEeM9GyvLj/ljQ22P9lxUpawdB04t89/1O/w1cDnyilFU='
});


// prepare server
app.use('/css', express.static(__dirname + '/htmlcss'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

var engine = require('ejs-locals');
app.engine('ejs',engine);
app.set('views','./views');
app.set('view engine','ejs');


bot.on('message', function(event) {
   if (event.message.type = 'text') {
    var msg = event.message.text;
    event.reply(msg).then(function(data) {
      // success 
      console.log(msg);
    }).catch(function(error) {
      // error 
      console.log('error');
    });
  }
});

const linebotParser = bot.parser();
app.post('/webhook', linebotParser);

var config = {
    host: 'ec2-54-235-163-246.compute-1.amazonaws.com',
    // Do not hard code your username and password.
    // Consider using Node environment variables.
    user: 'eaxzdhiykyiiph',     
    password: '468e4d857c5902a137bae39cb716ad75833430f19e68762c4f80f80417e1be47',
    database: 'd5a2ojn8eaksmp',
    port: 5432,
    ssl: true
};
var datachname ={
  chname:[],
};
var creatdata ={};
var data = {};
var tempdata = {};
var humdata = {};
var testdata =[];




var pool = new pg.Pool(config);

app.use(express.static(__dirname + '/public'));


app.get('/update', function(req, res){


  var temp = req.query.temp;
  var hum = req.query.hum;
  var watertemp = req.query.wtemp;
  // var sql = {
  //   temp:req.query.temp
  // };

  pool.connect(function(err,client,done) {
           if(err){
               console.log("not able to get connection "+ err);
               res.status(400).send(err);
           } 

            
            client.query("UPDATE sensor SET value = $1 WHERE name = 'Temperature'", [temp], function(err,result) {
                //call `done()` to release the client back to the pool
                 
                 // done(); 
                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }

             console.log("temp="+temp);

            });

            client.query("UPDATE sensor SET value = $1 WHERE name = 'Humidity'", [hum], function(err,result) {
                //call `done()` to release the client back to the pool
//                  done(); 

                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }

             console.log("hum="+hum);

            });

            client.query("UPDATE sensor SET value = $1 WHERE name = 'Watertemp'", [watertemp], function(err,result) {
                //call `done()` to release the client back to the pool
//                  done(); 

                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }

             console.log("Watertemp="+watertemp);

            });

            client.query("INSERT INTO history(name,value)VALUES('temp', $1)", [temp], function(err,result) {
                //call `done()` to release the client back to the pool
                 
                 // done(); 
                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }
            });

             client.query("INSERT INTO history(name,value)VALUES('humidity', $1)", [hum], function(err,result) {
                //call `done()` to release the client back to the pool
                 
                 done(); 
                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }
            });


            

            res.send("Data update&insert ok");

        }); 
});


app.get('/sensor', function(req, res){

  pool.connect(function(err,client,done) {
           if(err){
               console.log("not able to get connection "+ err);
               res.status(400).send(err);
           } 

            client.query('SELECT * FROM public.sensor' ,function(err,result) {
                //call `done()` to release the client back to the pool
                 
                 done(); 
                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }
             data = result.rows;

             // console.log("update sensordata ");

            });
        }); 

  res.json({data: data,moment: moment});

});

app.get('/chartdata', function (req, res) {
    pool.connect(function(err,client,done) {
           if(err){
               console.log("not able to get connection "+ err);
               res.status(400).send(err);
           } 

              // client.query("SELECT value,datetime FROM history WHERE name = 'temp' and datetime between now() - interval '1 min' and now()   " ,function(err,res) {
              //         //call `done()` to release the client back to the pool 
                                           
              //       if(err){
              //         console.log(err);
              //         res.status(400).send(err);
              //       }
              //     tempdata =  res.rows;
                  
              // });
              client.query("SELECT value,datetime FROM history WHERE name = 'temp'  and datetime between  now() - interval '2 hour' and now()  ORDER BY datetime   " ,function(err,res) {
                      //call `done()` to release the client back to the pool 
                                           
                    if(err){
                      console.log(err);
                      res.status(400).send(err);
                    }
                  tempdata =  res.rows;

                  // console.log(tempdata);
                  
              });

              // client.query("SELECT value,datetime FROM history WHERE name = 'humidity' and datetime between now() - interval '1 min' and now()   " ,function(err,res) {
              //         //call `done()` to release the client back to the pool
              //       done(); 
              //       if(err){
              //         console.log(err);
              //         res.status(400).send(err);
              //       }
              //     humdata =  res.rows;
              //     // console.log("set chartdata");
              // });
              client.query("SELECT value,datetime FROM history WHERE name = 'humidity'  and datetime between  now() - interval '2 hour' and now()  ORDER BY datetime    " ,function(err,res) {
                      //call `done()` to release the client back to the pool
                    done(); 
                    if(err){
                      console.log(err);
                      res.status(400).send(err);
                    }
                  humdata =  res.rows;
                  // console.log("set chartdata");
              });


              // client.query("SELECT name,value,datetime FROM history WHERE name in ('temp','humidity') GROUP BY name,datetime " ,function(err,res) {
              //         //call `done()` to release the client back to the pool 
                                           
              //       if(err){
              //         console.log(err);
              //         res.status(400).send(err);
              //       }
                  
              //       testdata = res.rows;
  
              // });

            res.json({tempdata: tempdata ,moment: moment,humdata: humdata,testdata: testdata});
         });
});

  app.get('/', function (req, res) {

    pool.connect(function(err,client,done) {
           if(err){
               console.log("not able to get connection "+ err);
               res.status(400).send(err);
           } 
         
          // console.log(keyName); //get參數
          
            client.query('SELECT * FROM public.sensor' ,function(err,result) {
                //call `done()` to release the client back to the pool
                 done(); 
                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }
            
            creatdata = result.rows;

            // for(var i = 0; i < result.rows.length; i++){

              // datachname.addchname = result.rows[0].name;
              // datachname.addchname = result.rows[1].name;
            // }

            // console.log(datachname);
            console.log("get connection  "+JSON.stringify(result.rows));

             res.render('index',{creatdata: creatdata,moment: moment});
            });
    }); 
});

// app.get('/', function (req, res) {

//   var keyName=req.query.name;

//     pool.connect(function(err,client,done) {
//        if(err){
//            console.log("not able to get connection "+ err);
//            res.status(400).send(err);
//        } 
	   
// 	    console.log(keyName); //get參數

//         client.query('SELECT * FROM public.sensor' ,function(err,result) {
//             //call `done()` to release the client back to the pool
             
//              done(); 
//              if(err){
//                  console.log(err);
//                  res.status(400).send(err);
//              }

//         // for (i = 0 ; i < result.rows.length ; i++){
//     		  // var row = result.rows[i];
//         //  }
//         // console.log();

//   		   data = result.rows;

//   		   console.log("get connection "+JSON.stringify(result.rows));
//              //res.status(200).send(result.rows[0]);
//   		   res.render('index',{data: data,moment: moment});
//         });
//     });
// });


app.get('/control', function(req, res){

  var cmd = req.query.cmd;
  
  

  if(isset(cmd) && !empty(cmd)){

    var client = net.connect(PORT, HOST, function(){
      console.log('客戶端連線…');
      // 向伺服器端發送資料，該方法其實就是 socket.write() 方法，因為 client 參數就是一個通訊端的物件
     
    });

    client.on('connect', function(data) {
        console.log('client端：與 server端 連線成功，可以開始傳輸資料')
    })

    client.write(cmd, function () {
      console.log('client端：開始傳輸資料，傳輸的資料為 ' + cmd)
    })

     // // data 事件
    client.on('data', function(data){
      response = data.toString().trim();
      console.log('client端：收到 server端 傳輸資料為 ' + response);

        if(response){

          app.get('/test', function(req, res){
             res.send({success: true});
          });

        }

      });
      
      // 輸出由 client 端發來的資料位元組長度
      // console.log('socket.bytesRead is ' + client.bytesRead);

      // 在列印輸出資料後，執行關閉用戶端的操作，其實就是 socket.end() 方法
      // client.end();
      // end 事件

      // res.render('index',{status: status}); 
    // console.log(company);

    client.on('end', function(){
      console.log('client disconnected');
    });

    
    res.send("Control GPIO " + cmd + "  Ok");
  }
  // res.render('about',{data: data.user});
});

// check running enviroment
var port = process.env.PORT || 3000;

app.listen(port);

if(port === 3000){
  console.log('RUN http://localhost:3000/')
}
