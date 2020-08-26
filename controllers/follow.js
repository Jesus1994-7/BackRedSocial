'use strict'

const path = require('path');
const fs = require('fs');
const mongooseP = require('mongoose-pagination');

const User = require('../models/user');
const Follow = require('../models/follow');
const { error } = require('console');

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
    },
    async unfollow(req, res) {
        const userId = req.user.id;
        const followId = req.params.id;

        Follow.find({'user': userId, 'followed': followId}).remove(error => {
            if(error) return res.status(500).send({message: 'Error al hacer unfollow'});

            return res.status(200).send({message: 'Unfollow !!'});
        })
    }
}

module.exports = FollowController;