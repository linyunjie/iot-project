var express = require('express');
var app = express();
var pg = require('pg');

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

// var keyName=request.query.name;

app.get('/', function (req, res) {
	
    pool.connect(function(err,client,done) {
       if(err){
           console.log("not able to get connection "+ err);
           res.status(400).send(err);
       } 
	   
	    console.log(req.query.name); //get參數
       
       client.query('SELECT * FROM public.jinne' ,function(err,result) {
          //call `done()` to release the client back to the pool
           done(); 
           if(err){
               console.log(err);
               res.status(400).send(err);
           }
		   
		   data.user = result.rows[0];
		   console.log(data.user);
		   
		   console.log("get connection "+JSON.stringify(result.rows[0]));
           //res.status(200).send(result.rows[0]);
		   res.render('index');
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