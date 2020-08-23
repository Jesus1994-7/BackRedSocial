'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//middleware
    //cada peticion la vamos a convertir a json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

module.exports = app;