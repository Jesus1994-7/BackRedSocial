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
    //a quien seguimos
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
    },
    //quien nos sigue
    async getFollowed (req, res) {
        let user = req.user.id; //recogemos id de usuario

        if(req.params.id && req.params.page){ //en caso de que pasemos la id por url..
            user = req.params.id;
        }

        let page = 1;

        //en caso de que se pase la pagina por url
        if(req.params.page){
            page = req.params.page;
        }else {
            page = req.params.id
        }

        const usersPage = 4; //usuarios por pagina

        //Con el metodo populate cambiamos el ObjectId de user por el objeto que le indicamos, en este caso (user)
        Follow.find({followed: user}).populate('user').paginate(page, usersPage, (error, follows, total) => {
            if(error) return res.status(500).send({message: 'Error en el servidor'});

            if(!follows) return res.status(404).send({message: 'No te sigue ningun usuario'});

            return res.status(200).send({
                total: total, //total de personas que seguimos 
                pages: Math.ceil(total/usersPage), //total de paginas
                follows 
            });

        }); 
    },

    async getMyFollows(req, res){
        let userId = req.user.id;

        //encuentra usuarios que sigo
        let find = Follow.find({user: userId});

        //si la url que se pasa es followed (booleano), encuentra los que me siguen
        if(req.params.followed){
            find = Follow.find({followed: userId});
        }

        find.populate('user followed').exec((error, follows) => {
            if(error) return res.status(500).send({message :'Error en el servidor'});

            if(!follows) return res.status(404).send({message : 'No sigues a nadie'});

            return res.status(200).send({follows});
        });
    }
}

module.exports = FollowController;