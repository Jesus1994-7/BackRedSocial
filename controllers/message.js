'use strict'

const moment = require('moment');
const mongoosePage = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');
const Message = require('../models/message');

function prueba(req,res) {
    return res.status(200).send({ message: 'Hola function'})
}

module.exports = {
    prueba
}