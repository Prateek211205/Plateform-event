
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
console.log('----------hello------');