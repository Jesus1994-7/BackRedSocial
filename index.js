'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Conexion con MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/REDSOCIAL', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('La conexion ha sido establecida correctamente')
}).catch(error => console.log(error))