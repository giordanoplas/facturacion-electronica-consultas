const express = require('express');
const mysql = require('mysql');
var bodyParser = require('body-parser');
const myconn = require('express-myconnection');
const routes = require('./routes');
const app = express();
const fs = require('node:fs');
process.on('uncaughtException', function (err) {
    var dateTime = new Date();

    console.log(dateTime.toLocaleString('en-CA'));
    console.log(err);

    let content = `${dateTime ? dateTime.toLocaleString('sv-SE').split(' ')[1] : 'datetime'}\n${err}`;
    content += "\n\n";
    try {
        var filename = dateTime ? dateTime.toLocaleString('sv-SE').split(' ')[0] : 'filename';
        fs.appendFile(`./logs/${filename}.log`, content, err => {
            if (err) {
                console.error(err);
            }
        });
        // file written successfully
    } catch (err) {
        console.error(err);
    }
});
app.set('port', process.env.API_PORT || 3018)
const dbOptions = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA,
    connectionLimit: 2,
    connectTimeout: 10000,
    waitForConnections: true,
    autoReconnect: true
}

// middlewares -------------------------------------------
/** Strategies of connections
 * single – creates a single database connection for the whole application instance. The connection is never closed. In case of a disconnection, it will try to reconnect again as described in the node-mysql docs.
 * pool – creates pool of connections on an app instance level, and serves a single connection from the pool per request. The connection is auto released to the pool at the response end.
 * request – creates new connection per each request, and automatically closes it at the response end.
 */
app.use(myconn(mysql, dbOptions, 'pool'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// routes ------------------------------------------------
app.get('/', (req, res) => {
    res.send('Welcome to my API');
})
app.use('/api/v1', routes);

// Server Running ------------------------------------------------
app.listen(app.get('port'), () => {
    console.log("API running on port", app.get('port'));
});