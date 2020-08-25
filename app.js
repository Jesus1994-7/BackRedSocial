'use strict'

var express = require('express');

var app = express();

//carga de rutas
var user_routes = require('./routes/users');


//middleware
//cada peticion la vamos a convertir a json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//rutas
app.use('/api', user_routes);

module.exports = app;