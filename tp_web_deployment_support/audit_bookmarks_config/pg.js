const express = require('express')
const https = require('https')
const fs = require('fs')
const app = express()
const port = 9005
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));

console.log("-----")

const expressip = require('express-ip');
app.use(expressip().getIpInfoMiddleware);
app.get('/', function(req, res) {
    console.log(req.ipInfo.ip);
    res.send(req.ipInfo)
	console.log("-----")
});
process.on('uncaughtException', function(err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
let rawdata = fs.readFileSync(__dirname + '/config/db_config.json');
let storage = JSON.parse(rawdata);
console.log(storage.host)
const config = {
    host: storage.host,
    port: storage.port,
    database: storage.database,
    user: storage.user,
    password: storage.password
};
const uaa_config = {
    host: storage.host,
    port: storage.uaaport,
    database: storage.uaadatabase,
    user: storage.uaauser,
    password: storage.uaapassword
};

const {
    Client
} = require('pg');
const client = new Client(config);
const uaa_client = new Client(uaa_config);
client.connect();
uaa_client.connect()
//const pool = new pg.Pool(config);
//const uaapool = new pg.Pool(uaa_config);

app.get('/ip', function(req, res) {
    var data = {}

    remotehost = req.connection.remoteAddress

    data.ip = remotehost
    res.send(data)
})

app.get('/get_users', function(req, res) {

    uaa_client.query("SELECT username FROM public.users where username not in ('reader', 'writer', 'super', 'postgresuser') order by username asc", (err, result) => {
        if (err) {

            console.log(err.stack)
            return;

        } else {
            res.send(result.rows);
        }
    })

});
app.post('/create_bookmark', function(req, res) {



    var username = req.body.username,
        zoom = req.body.zoom,
        bk_name = req.body.bookmark_name;
        var get_recs="SELECT * FROM public.bookmarks where bookmark_name ='" + bk_name + "' and username ='" + username + "'"
    client.query(get_recs, (err, result) => {


        if (err) {

            console.log(err)
            return;

        } else {
            if (result.rows.length > 0) {
                res.end('{"success" : "Bookmark already present .Please try with another name","status" : 200}');
            } else {
                const insert_query = "INSERT INTO public.bookmarks(username ,creation_date,bookmark_name,latitude,longitude,zoom) VALUES ('" + req.body.username + "','" + req.body.creation_date + "','" + req.body.bookmark_name + "','" + req.body.latitude + "','" + req.body.longitude + "','" + zoom + "' )";
                client.query(insert_query, (err, response) => {

                    if (err) {
                        console.log(err);
                        return;
                    }
                    res.end('{"success" : "Bookmark created successfully.", "status" : 200}');

                });

            }

        }
    })



})
app.post('/get_bookmarks', function(req, res) {

    var username = req.body.username;

    client.query("SELECT * FROM public.bookmarks where username ='" + username + "'", (err, result) => {

        if (err) {

            console.log(err.stack)
            return;

        } else {

            console.log("sucess")
            res.end('{"bms_data" :' + JSON.stringify(result.rows) + '}');




        }
    })


})

app.post('/delete_bookmark', function(req, res) {


    var bookmark_name = req.body.bookmark_name;
    client.query("DELETE FROM public.bookmarks where bookmark_name ='" + bookmark_name + "'", (err, result) => {


        if (err) {

            console.log(err);
            return;

        } else {

            console.log("sucess")
            res.end('{"success" : "Bookmark deleted successfully.", "status" : 200}');




        }
    })



})

app.post('/insert_login', function(req, res) {


    var username = req.body.username,
        logintime = req.body.logintime;
    // const insert_query = "INSERT INTO public.audit_table(username ,login,ip) VALUES ('" + req.body.username + "','" + req.body.logintime + "','" + req.connection.remoteAddress + "')";
    const insert_query = "INSERT INTO public.audit_table(username ,login,ip) VALUES ('" + req.body.username + "','" + req.body.logintime + "','" + req.body.ip + "')";
    console.log(insert_query)
    client.query(insert_query, (err, response) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("sucess")
        res.end('Data inserted successfully');

    });


})

app.post('/update_logout', function(req, res) {


    var update_query = "UPDATE public.audit_table set logout = '" + req.body.logouttime + "' where username='" + req.body.username + "' and login='" + req.body.login + "'";
    console.log(update_query)
    client.query(update_query, (err, response) => {
        if (err) {
            console.error(err);
            return;
        }
        res.send('Data updated successfully');

    });

})
app.post('/audit_report', function(req, res) {

    var user = req.body.username;
    var login = req.body.login;
    var logout = req.body.logout;
    let loginsplit = login.split("/")
    let logoutsplit = logout.split("/")
    login = loginsplit[2] + "-" + loginsplit[1] + "-" + loginsplit[0] + " 00:00:00";
    logout = logoutsplit[2] + "-" + logoutsplit[1] + "-" + logoutsplit[0] + " 23:59:00";


    console.log(user, login, logout)
    if (user == "all") {

        client.query("SELECT * FROM public.audit_table where login between '" + login + "' and '" + logout + "' order by id", (err, result) => {

            if (err) {

                console.log(err.stack)
                return;

            } else {
                res.send(result.rows);
            }
        })
    } else {

        client.query("SELECT * FROM public.audit_table where username = '" + user + "' and login between '" + login + "' and '" + logout + "' order by id", (err, result) => {

            if (err) {

                console.log(err.stack)
                return;

            } else {
                res.send(result.rows);
            }
        })
    }


});
const sslOptions = {
    key: fs.readFileSync(__dirname + '/config/ssl.key.pem'),

    cert: fs.readFileSync(__dirname + '/config/ssl.cert.pem'),
    port: 443

};


//app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
https.createServer(sslOptions, app).listen(port, function() {
   console.log(`Example app listening at http://localhost:${port}`)
})