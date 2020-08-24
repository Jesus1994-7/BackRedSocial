'use strict'

const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const mongoosePaginate = require('mongoose-pagination');
const { use } = require('../routes/user');

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
                            //generar token y devolver token
                            return res.status(200).send({
                                token: jwt.createToken(user)
                            });
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
        });
    },

//datos de usuario

    async getUser(req,res){
        const userId = req.params.id;

        User.findById(userId, (err, user) => {
            if(err) return res.status(500).send({message: 'Error en la petición'});

            if(!user) return res.status(404).send({message: 'El usuario no existe'});

            return res.status(200).send({user});
        });
    },

//devolver listado de usuarios paginados

    async getUsers(req,res) {
        //recogemos el id del usuario logueado en este momento
        const identity_user_id = req.user.sub;

        let page = 1;
        if(req.params.page){
            page = req.params.page; 
        }
        //cantidad de usuarios logueados por pagina
        var itemsPerPage = 5;
        
        User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});

            if(!users) return res.status(404).send({message: 'No hay usuarios disponibles'});

            return res.status(200).send({
                users,
                total,
                pages: Math.ceil(total/itemsPerPage) //saca el numero de paginas que van a existir
            });
        });
    },

    async updateUser(req,res) {
        const userId = req.params.id;
        const update = req.body;

        //hay que borrar la password y actualizarla por separado
        delete update.password;

        if(userId != req.user.sub){
            return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'})
        }
        //busco usuario por id, le paso los datos a actualizar y el objeto modificado(new)
        User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => {
            if(err) return res.status(500).send({message: 'Error en la peticion'});

            if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario'});

            return res.status(200).send({user: userUpdated})
        });
    }
}
module.exports = UserController;