const express = require("express");
const app = express();
const pg = require("pg");
const moment = require("moment");
const http = require("http");
const linebot = require("linebot");
const isset = require("isset");
const empty = require("is-empty");
const check = require("check-types");
const net = require("net"); // 引入網路 (Net) 模組
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

//net 連線設定
var HOST = "59.127.58.16";
var PORT = 10090;

var server = http.createServer(app);
var io = require("socket.io")(server); // 加入 Socket.IO

// Passport Config
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// check running enviroment
var port = process.env.PORT || 3000;
app.listen(port, console.log("RUN http://localhost:3000/"));

// server.listen(3000, function(){
//   console.log('listening on *:3000');
// });

require("dotenv").config();

console.log(process.env.CHRIS); ///.env 檔測試

//linebot config
var bot = linebot({
  channelId: "1653596866",
  channelSecret: "23f49e04f290f01d7960086188bff0d3",
  channelAccessToken:
    "YW+v70OLwnVOIipHZIDMY2QS6JZkIYIxdXbNJwgaet4rR8Isb3Nqa6pP0hf6UPG035RSx39XMG31FERr655oKd1ab2600LzMgKwfLhGZGQ7XM1hZUUam0vNfgIPwsQVEeM9GyvLj/ljQ22P9lxUpawdB04t89/1O/w1cDnyilFU="
});

//SQL資料庫連線設定
var config = {
  host: "ec2-54-235-163-246.compute-1.amazonaws.com",
  // Do not hard code your username and password.
  // Consider using Node environment variables.
  user: "eaxzdhiykyiiph",
  password: "468e4d857c5902a137bae39cb716ad75833430f19e68762c4f80f80417e1be47",
  database: "d5a2ojn8eaksmp",
  port: 5432,
  ssl: true
};

// prepare server
app.use(express.static(__dirname + "/"));
app.use(express.static(__dirname + "/public"));
app.use("/css", express.static(__dirname + "/htmlcss"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js")); // redirect bootstrap JS
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist")); // redirect JS jQuery
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css")); // redirect CSS bootstrap

//EJS
app.use(expressLayout);
// var engine = require('ejs-locals');
// app.engine('ejs', engine);
// app.set('views', './views');
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: false }));

//Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

//linebot message
bot.on("message", function(event) {
  if ((event.message.type = "text")) {
    var msg = event.message.text;
    event
      .reply(msg)
      .then(function(data) {
        // success
        console.log(msg);
      })
      .catch(function(error) {
        // error
        console.log("error");
      });
  }
});

//linebot
const linebotParser = bot.parser();
app.post("/webhook", linebotParser);

// var creatdata = {}; //初始化表格資料
var data = {}; //更新表格資料
var tempdata = {}; //更新溫度圖表資料
var humdata = {}; //更新濕度圖表資料
var wtempdata = {}; //更新水溫圖表資料

// var testdata = []; //測試

controlstatus = "初始化";

var pool = new pg.Pool(config);

// Esp32 接收感測器資料
app.get("/update", function(req, res) {
  var temp = req.query.temp;
  var hum = req.query.hum;
  var watertemp = req.query.wtemp;
  // var sql = {
  //   temp:req.query.temp
  // };

  pool.connect(function(err, client, done) {
    if (err) {
      console.log("not able to get connection " + err);
      res.status(400).send(err);
    }

    client.query(
      "UPDATE sensor SET value = $1 WHERE name = '水質硬度'",
      [temp],
      function(err, result) {
        //call `done()` to release the client back to the pool

        // done();
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }

        console.log("temp=" + temp);
      }
    );

    client.query(
      "UPDATE sensor SET value = $1 WHERE name = '水質酸鹼'",
      [hum],
      function(err, result) {
        //call `done()` to release the client back to the pool
        //                  done();

        if (err) {
          console.log(err);
          res.status(400).send(err);
        }

        console.log("hum=" + hum);
      }
    );

    client.query(
      "UPDATE sensor SET value = $1 WHERE name = '水溫'",
      [watertemp],
      function(err, result) {
        //call `done()` to release the client back to the pool
        //                  done();

        if (err) {
          console.log(err);
          res.status(400).send(err);
        }

        console.log("Watertemp=" + watertemp);
      }
    );

    client.query(
      "INSERT INTO history(name,value)VALUES('watertemp', $1)",
      [watertemp],
      function(err, result) {
        //call `done()` to release the client back to the pool

        // done();
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
      }
    );

    client.query(
      "INSERT INTO history(name,value)VALUES('temp', $1)",
      [temp],
      function(err, result) {
        //call `done()` to release the client back to the pool

        // done();
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
      }
    );

    client.query(
      "INSERT INTO history(name,value)VALUES('humidity', $1)",
      [hum],
      function(err, result) {
        //call `done()` to release the client back to the pool

        done();
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
      }
    );

    res.send("Data update&insert ok");
  });
});

//更新感測器資料
app.get("/sensor", function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("not able to get connection " + err);
      res.status(400).send(err);
    }

    client.query("SELECT * FROM public.sensor ", function(err, result) {
      //call `done()` to release the client back to the pool

      done();
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      data = result.rows;

      // console.log("update sensordata ");
    });
  });

  res.json({ data: data, moment: moment });
});

//圖表數據產生
app.get("/chartdata", function(req, res) {
  pool.connect(function(err, client, done) {
    if (err) {
      console.log("not able to get connection " + err);
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
    client.query(
      "SELECT value,datetime FROM history WHERE name = 'temp'  and datetime between  now() - interval '2 hour' and now()  ORDER BY datetime   ",
      function(err, res) {
        //call `done()` to release the client back to the pool

        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        tempdata = res.rows;

        // console.log(tempdata);
      }
    );

    client.query(
      "SELECT value,datetime FROM history WHERE name = 'watertemp'  and datetime between  now() - interval '2 hour' and now()  ORDER BY datetime   ",
      function(err, res) {
        //call `done()` to release the client back to the pool

        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        wtempdata = res.rows;

        // console.log(tempdata);
      }
    );

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
    client.query(
      "SELECT value,datetime FROM history WHERE name = 'humidity'  and datetime between  now() - interval '2 hour' and now()  ORDER BY datetime    ",
      function(err, res) {
        //call `done()` to release the client back to the pool
        done();
        if (err) {
          console.log(err);
          res.status(400).send(err);
        }
        humdata = res.rows;
        // console.log("set chartdata");
      }
    );

    // client.query("SELECT name,value,datetime FROM history WHERE name in ('temp','humidity') GROUP BY name,datetime " ,function(err,res) {
    //         //call `done()` to release the client back to the pool

    //       if(err){
    //         console.log(err);
    //         res.status(400).send(err);
    //       }

    //       testdata = res.rows;

    // });

    res.json({
      tempdata: tempdata,
      moment: moment,
      humdata: humdata,
      wtempdata: wtempdata
    });
  });
});

// app.get('/', function (req, res) {

//   pool.connect(function (err, client, done) {
//     if (err) {
//       console.log("not able to get connection " + err);
//       res.status(400).send(err);
//     }

//     // console.log(keyName); //get參數

//     client.query('SELECT * FROM public.sensor', function (err, result) {
//       //call `done()` to release the client back to the pool
//       done();
//       if (err) {
//         console.log(err);
//         res.status(400).send(err);
//       }

//       creatdata = result.rows;

//       // for(var i = 0; i < result.rows.length; i++){

//       // datachname.addchname = result.rows[0].name;
//       // datachname.addchname = result.rows[1].name;
//       // }

//       // console.log(datachname);
//       console.log("get connection  " + JSON.stringify(result.rows));

//       res.render('index', { creatdata: creatdata, moment: moment, title: '智慧監控魚缸', success: 'null' });
//     });
//   });
// });

app.get("/control", function(req, res) {
  var cmd = req.query.cmd;

  if (isset(cmd) && !empty(cmd)) {
    var client = net.connect(PORT, HOST, function() {
      console.log("客戶端連線…");
      // 向伺服器端發送資料，該方法其實就是 socket.write() 方法，因為 client 參數就是一個通訊端的物件
    });

    client.on("connect", function(data) {
      console.log("client端：與 server端 連線成功，可以開始傳輸資料");

      controlstatus = "控制成功";
      // app.get('/success', function(req, res){
      //     res.send({success: controlstatus});
      //   });
    });

    client.write(cmd, function() {
      console.log("client端：開始傳輸資料，傳輸的資料為 " + cmd);
    });

    // // data 事件
    client.on("data", function(data) {
      response = data.toString().trim();
      console.log("client端：收到 server端 傳輸資料為 " + response);
    });

    // 輸出由 client 端發來的資料位元組長度
    // console.log('socket.bytesRead is ' + client.bytesRead);

    // 在列印輸出資料後，執行關閉用戶端的操作，其實就是 socket.end() 方法
    // client.end();
    // end 事件

    // console.log(company);
    client.on("error", function(err) {
      console.log("Error: " + err.message);

      controlstatus = "控制失敗";
      // app.get('/success', function(req, res){
      //    res.send({success: controlstatus});
      //  });
    });

    client.on("end", function() {
      console.log("client disconnected");
    });

    res.send("Control GPIO " + cmd + "  Ok");
  }

  app.get("/success", function(req, res) {
    res.send({ success: controlstatus });
  });

  // res.render('about',{data: data.user});
});
