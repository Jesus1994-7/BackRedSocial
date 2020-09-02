'use strict'

const moment = require('moment');
const mongoosePage = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');
const Message = require('../models/message');

//enviar mensaje
function doMessage(req,res) {
    const params = req.body;

    if(!params.text && !params.receiver) {
        return res.status(200).send({ message : 'Envia los datos necesarios'});
    }

    const message = new Message();
    message.emitter = req.user.id;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();

    message.save((err, messageSave) => {
        if(err) return res.status(500).send({ message : 'Error en la peticion'});

        if(!messageSave) return res.status(500).send({ message : 'Error al guardar el mensaje'});

        return res.status(200).send({ message : messageSave});

    })
}

//mensajes recividos
function myRecivedMessages(req,res) {
    const userId = req.user.id //usuario logueado

    let page = 1
    if(req.params.page) {
        page = req.params.page
    }

    const itemsPerPage = 4;

    Message.find({ receiver: userId }).populate('emitter', 'name surname _id image nick').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({ message : 'Error en la peticion'});

        if(!messages) return res.status(404).send({ message: 'No hay mensajes'})

        return res.status(200).send({ 
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages: messages
        })
    })
}

//mensajes enviados

function myEmittedMessages(req,res) {
    const userId = req.user.id //usuario logueado

    let page = 1
    if(req.params.page) {
        page = req.params.page
    }

    const itemsPerPage = 4;

    Message.find({ emitter: userId }).populate('emitter receiver', 'name surname _id image nick').paginate(page, itemsPerPage, (err, messages, total) => {
        if(err) return res.status(500).send({ message : 'Error en la peticion'});

        if(!messages) return res.status(404).send({ message: 'No hay mensajes'})

        return res.status(200).send({ 
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages: messages
        })
    })
}
module.exports = {
    doMessage,
    myRecivedMessages,
    myEmittedMessages
}