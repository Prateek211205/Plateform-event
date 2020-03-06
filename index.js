const express = require('express');
const app = express();
var mustacheExpress = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const requestSalesforce = require('request');
var MemoryStore = require('memorystore')(session)
//initialize session
app.use(session({secret: 'S3CRE7', 
store: new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
}),
resave: true, saveUninitialized: true}));
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
//bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

var jsforce = require('jsforce');


var data = {
    clientId : '3MVG9G9pzCUSkzZse9DwRP5WhcNNEBZ8TEFeTuVc3qfDWY4WYIE04lr3zsJn8m5vGnjAkKdUoJcKzr9fcuK58',
    clientSecret : '7655E00C5CEF4DD191D5F2F67FD348270455BB828E8B4D7EBDF82F7A28264C55',
    redirectUri: 'http://localhost:400/access'
    
  };


app.use(express.static(__dirname + '/public'));

app.set('views', __dirname+'/views');

let salesforce;
app.get('/', (req, res) => {
    var conn = new jsforce.Connection({oauth2:data});
    conn.login('prateek211205@appirio.com','sanu2112061Ilj0KngZrRKFjtZWG7jkGDNL', function(err, userInfo) {
        console.log(err);
        req.session.accessToken = conn.accessToken;
        req.session.instanceUrl = conn.instanceUrl;
        res.render('index');
    });
    
});
var port = process.env.port || 400;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));