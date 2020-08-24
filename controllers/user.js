'use strict'

var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

const UserController = {
    async home(req, res) {
        res.status(200).send({
            message: 'Hola mundo'
        });
    },

    async pruebas(req, res) {
        console.log(req.body);
        res.status(200).send({
            message: 'Accion de pruebas'
        });
    },

    async saveUser(req, res) {
        const params = req.body;
        const user = new User();

        if (params.name && params.surname &&
            params.nick && params.email && params.password) {

            user.name = params.name;
            user.surname = params.surname;
            user.nick = params.nick;
            user.email = params.email;
            user.role = 'ROLE_USER';
            user.image = null;

            //Comprobación de si un email o nick ya existen
            User.find({
                $or: [
                    { email: user.email.toLowerCase() },
                    { nick: user.nick.toLowerCase() }
                ]
            }).exec((err, users) => {
                if (err) return res.status(500).send({ message: 'Error en la peticion de usuarios' });

                if (users && users.length >= 1) {
                    return res.status(200).send({ message: 'El usuario que intentas registrar ya existe' });
                } else {

                    //encriptación de contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        user.save((err, userStored) => {
                            if (err) return res.status(500).send({ message: 'Error al guardar el usuario' })

                            if (userStored) {
                                res.status(200).send({ user: userStored });
                            } else {
                                res.status(404).send({ message: 'No se ha registrado el usuario' });
                            }
                        });
                    });
                }
            })
        } else {
            res.status(200).send({
                message: 'Rellena todos los campos'
            });
        }
    },

    async login(req, res) {
        const params = req.body;

        const email = params.email;
        const password = params.password;

        User.findOne({ email: email }, (err, user) => {
            if (err) return res.status(500).send({ message: 'Error en la peticion' });

            if (user) { //si la password que nosotros mandamos es igual a la encriptada
                bcrypt.compare(password, user.password, (err, check) => {
                    if (check) {

                        if (params.getToken) {
                            //devolvemos token
                            //generar token
                        } else {
                            //devolvemos datos de usuario quitando la contraseña
                            user.password = undefined;
                            return res.status(200).send({ user })
                        }
                    } else {
                        return res.status(404).send({ message: 'El usuario no se ha podido loguear' })
                    }
                })
            } else {
                return res.status(404).send({ message: 'El usuario no se ha podido identificar' })
            }
        })
    }
}



module.exports = UserController;