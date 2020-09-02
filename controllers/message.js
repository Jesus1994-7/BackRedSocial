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
    message.viewed = 'false';

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
        });
    });
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
        });
    });
}

//mensajes sin leer

function unreadMessage(req,res) {
    const userId = req.user.id;

    //utilizamos count para contar el numero de mensajes sin leer donde viewed sea false
    Message.count({ receiver : userId, viewed : 'false'}).exec((err, count) => {
        if(err) return res.status(500).send({ message : 'Error en la peticion'});

        return res.status(200).send({
            'unviewed' : count
        });
    });
}

//actualizar documentos a leidos

function readMessage(req, res) {
    const userId = req.user.id;

    //recogemos los usuarios que reciben los mensajes, los pasamos a true en visto y con multi hacemos qu varios documentos se actualicen
    Message.update({ receiver: userId, viewed : 'false'}, { viewed : 'true'}, {"multi" : true}, ((err, messageUpdated) => {
        if(err) return res.status(500).send({ message : 'Error en la peticion'});

        return res.status(200).send({
            messages : messageUpdated
        });
    }));
}
module.exports = {
    doMessage,
    myRecivedMessages,
    myEmittedMessages,
    unreadMessage,
    readMessage
}