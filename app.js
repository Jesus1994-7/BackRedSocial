'use strict'

var express = require('express');

var app = express();

//carga de rutas
const userRoutes = require('./routes/users');
const followRoutes = require('./routes/follows');
const publicationRoutes = require('./routes/publications');
const messageRoutes = require('./routes/messages');

//middleware
//cada peticion la vamos a convertir a json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//rutas
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicationRoutes);
app.use('/api', messageRoutes);

module.exports = app;