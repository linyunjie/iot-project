const pg = require('pg');

const config = {
    host: 'ec2-54-235-163-246.compute-1.amazonaws.com',
    // Do not hard code your username and password.
    // Consider using Node environment variables.
    user: 'eaxzdhiykyiiph',     
    password: '468e4d857c5902a137bae39cb716ad75833430f19e68762c4f80f80417e1be47',
    database: 'd5a2ojn8eaksmp',
    port: 5432,
    ssl: true
};

const client = new pg.Client(config);

client.connect(err => {
    if (err) throw err;
    else { queryDatabase(); }
});

function queryDatabase() {
  
    console.log(`Running query to PostgreSQL server: ${config.host}`);

    //const query = 'SELECT * FROM inventory;';

    //client.query(query)
        //.then(res => {
            //const rows = res.rows;

            //rows.map(row => {
                //console.log(`Read: ${JSON.stringify(row)}`);
            //});

            //process.exit();
        //})
        //.catch(err => {
            //console.log(err);
        //});

}