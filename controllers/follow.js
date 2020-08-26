'use strict'

const path = require('path');
const fs = require('fs');
const mongooseP = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');

const FollowController = {

    async followed(req, res) {
        const params = req.body;

        const follow = new Follow();
        follow.user = req.user.id; //aqui tenemos el usuario identificado por el middleware
        follow.followed = params.followed; //pasamos el usuario a seguir 

        follow.save((error, followStored) => {
            if(error) return res.status(500).send({message: 'Error al guardar el follow'});

            if(!followStored) return res.status(404).send({message: 'El follow no se ha guardado'});

            return res.status(200).send({follow: followStored})
        })
    }
}

module.exports = FollowController;