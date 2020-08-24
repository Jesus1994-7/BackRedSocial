'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//carga de rutas
var user_routes = require('./routes/user');


//middleware
    //cada peticion la vamos a convertir a json
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//rutas
app.use('/api', user_routes);

module.exports = app;