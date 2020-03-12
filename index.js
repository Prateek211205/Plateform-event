const express = require('express');
const faye = require('faye');
const http = require('http');
const app = express();
var server = http.createServer(app);
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
        subscribeToPlatformEvents(conn.instanceUrl, conn.accessToken);
        res.render('index');
    });
    
});



app.get('/case', (request, response) => {
    
     console.log(request.session.instanceUrl);
    let caseId = request.query.id;
    if(!caseId){
        return;
    }
    let conn = new jsforce.Connection({
        oauth2 : data,
        accessToken: request.session.accessToken,
        instanceUrl: request.session.instanceUrl
    });
    var data = [{label:'New', active: false},{label:'Working', active: false},{label:'Escalated', active: false}];
    conn.sobject("Case").retrieve(caseId, function(err, result) {
       if(!result){return}
       for(let item in data){
            data[item].active = true
            if(data[item].label == result.Status){
              break;
            }
        }
        response.setHeader('token', request.session.accessToken);
        response.send({result,data});
    });
});

app.post('/case', (request, response) => {
  let url =  request.session.instanceUrl+'/services/data/v48.0/sobjects/Case_Demo__e/';
  const options = {
    url,
    json: true,
    'auth': {
      'bearer': request.session.accessToken
    },
    body: {
       Case_Id__c: request.body.caseId,
       Performed_By__c: request.body.name ? request.body.name : 'Prateek  Chaturvedi',
       Status__c : request.body.status
    }
};
requestSalesforce.post(options, function(err, httpResponse, body){
    response.send(httpResponse.body.success);
});
  
  
});

let subscribeToPlatformEvents = (url, token) => {
  var client = new faye.Client(url + '/cometd/47.0/');
  client.setHeader('Authorization', 'OAuth ' + token);
  client.subscribe('/event/Case_Demo__e', function(message) {
      console.log(message);
  });
};

var bayeux = new faye.NodeAdapter({mount: '/faye',timeout: 3});
var PORT = process.env.PORT || 400;
bayeux.attach(server);

server.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
