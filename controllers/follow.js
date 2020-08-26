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
        const userId = req.user.id; //recogemos el id del usuario
        const followId = req.params.id; //por url pasamos el id que vamos a dejar de seguir

        Follow.find({'user': userId, 'followed': followId}).remove(error => {
            if(error) return res.status(500).send({message: 'Error al hacer unfollow'});

            return res.status(200).send({message: 'Unfollow !!'});
        })
    },

    async getFollows(req, res) {
        let user = req.user.id; //recogemos id de usuario

        if(req.params.id && req.params.page){ //en caso de que pasemos la id por url..
            user = req.params.id;
        }

        let page = 1;

        //en caso de que se pase la pagina por url
        if(req.params.page){
            page = req.params.page;
        }

        const usersPage = 4; //usuarios por pagina

        //Con el metodo populate cambiamos el ObjectId de user por el objeto que le indicamos, en este caso (followed)
        Follow.find({user: user}).populate({path: 'followed'}).paginate(page, usersPage, (error, follows, total) => {
            if(error) return res.status(500).send({message: 'Error en el servidor'});

            if(!follows) return res.status(404).send({message: 'No sigues a ningun usuario'});

            return res.status(200).send({
                total: total, //total de personas que seguimos 
                pages: Math.ceil(total/usersPage), //total de paginas
                follows 
            });

        });
    }
}

module.exports = FollowController;