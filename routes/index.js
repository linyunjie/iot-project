const express = require('express');
const moment = require('moment');
const router = express.Router();
const pg = require('pg');

const app = express();

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

var creatdata = {}; //初始化表格資料
var data = {};  //更新表格資料
var tempdata = {}; //更新溫度圖表資料
var humdata = {}; //更新濕度圖表資料
var wtempdata = {}; //更新水溫圖表資料
controlstatus = "初始化";

var pool = new pg.Pool(config);

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    pool.connect(function (err, client, done) {
        if (err) {
            console.log("not able to get connection " + err);
            res.status(400).send(err);
        }

        client.query('SELECT * FROM public.sensor', function (err, result) {
            //call `done()` to release the client back to the pool
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }

            creatdata = result.rows;

            console.log("get connection  " + JSON.stringify(result.rows));

            res.render('dashboard', { creatdata: creatdata, title: '魚缸智慧監控', moment: moment });
        });
    })

    // res.render('dashboard', {
    //     name: req.user.name,
    //     title: '智慧監控魚缸'
    // })
);




module.exports = router;
