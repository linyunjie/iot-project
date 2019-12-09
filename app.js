var express = require('express');
var app = express();
var pg = require('pg');
var moment = require('moment');
var linebot = require('linebot');


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
  console.log(event); //把收到訊息的 event 印出來看看
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


var pool = new pg.Pool(config);

app.use(express.static(__dirname + '/public'));


app.get('/update', function(req, res){


  var temp = req.query.temp;
  var hum = req.query.hum;
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
                 
                 done(); 
                 if(err){
                     console.log(err);
                     res.status(400).send(err);
                 }

             console.log("hum="+hum);

            });

            // client.query("INSERT INTO history(name,value)VALUES('temp', $1)", [temp], function(err,result) {
            //     //call `done()` to release the client back to the pool
                 
            //      // done(); 
            //      if(err){
            //          console.log(err);
            //          res.status(400).send(err);
            //      }
            // });

            //  client.query("INSERT INTO history(name,value)VALUES('humidity', $1)", [hum], function(err,result) {
            //     //call `done()` to release the client back to the pool
                 
            //      done(); 
            //      if(err){
            //          console.log(err);
            //          res.status(400).send(err);
            //      }
            // });


            

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
              client.query("SELECT value,datetime FROM history WHERE name = 'temp'   " ,function(err,res) {
                      //call `done()` to release the client back to the pool 
                                           
                    if(err){
                      console.log(err);
                      res.status(400).send(err);
                    }
                  tempdata =  res.rows;
                  
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
              client.query("SELECT value,datetime FROM history WHERE name = 'humidity'   " ,function(err,res) {
                      //call `done()` to release the client back to the pool
                    done(); 
                    if(err){
                      console.log(err);
                      res.status(400).send(err);
                    }
                  humdata =  res.rows;
                  // console.log("set chartdata");
              });




              
            res.json({tempdata: tempdata ,moment: moment, humdata: humdata});
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


// app.get('/about', function(req, res){
//   res.render('about',{data: data.user});
// });

// check running enviroment
var port = process.env.PORT || 3000;

app.listen(port);

if(port === 3000){
  console.log('RUN http://localhost:3000/')
}