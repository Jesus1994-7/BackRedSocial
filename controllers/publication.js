'use strict'

const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePage = require('mongoose-pagination');

const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');

function savePublication(req, res) {
    const params = req.body;

    if(!params.text){
        return res.status(200).send({ message: 'Debes enviar un texto'});

    }
    const publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.id;
    publication.created_at = moment().unix()

    publication.save((err, publication) => {
        if(err) return res.status(500).send({ message : 'Error al guardar la publicacion'});

        if(!publication) return res.status(404).send({ message: 'La publicacion no ha sido guardada'});

        return res.status(200).send({publication: publication});
    })
}

function getPublication(req,res) {
    
}

module.exports = {
    savePublication
}