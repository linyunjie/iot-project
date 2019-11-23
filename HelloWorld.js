var express = require('express');
var app = express();
var pg = require('pg');
var moment = require('moment');


// prepare server

app.use('/css', express.static(__dirname + '/htmlcss'));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

var engine = require('ejs-locals');
app.engine('ejs',engine);
app.set('views','./views');
app.set('view engine','ejs');

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

var data = {};



var pool = new pg.Pool(config);

app.use(express.static(__dirname + '/public'));

app.get('/sensor', function(req, res){


  
});




app.get('/', function (req, res) {

  var keyName=req.query.name;

    pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
	   
	    console.log(keyName); //get參數
       
       client.query('SELECT * FROM public.sensor' ,function(err,result) {
          //call `done()` to release the client back to the pool
           
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }

        for (i = 0 ; i < result.rows.length ; i++){
  		    var row = result.rows[i];
         }
      // console.log();

		   data = result.rows;

		   console.log("get connection "+JSON.stringify(result.rows));
           //res.status(200).send(result.rows[0]);
		   res.render('index',{data: data,moment: moment});

       });
    });
});


app.get('/about', function(req, res){
  res.render('about',{data: data.user});
});

// check running enviroment
var port = process.env.PORT || 3000;

app.listen(port);

if(port === 3000){
  console.log('RUN http://localhost:3000/')
}