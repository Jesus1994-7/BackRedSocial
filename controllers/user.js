'use strict'

const User = require('../models/user');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const mongoosePaginate = require('mongoose-pagination');
const fs = require('fs'); //trabajar con archivos
const path = require('path'); //trabajar con rutas


const UserController = {

    async register(req, res) {
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
            }).exec((error, users) => {
                if (error) return res.status(500).send({ message: 'Error en la peticion de usuarios' });

                if (users && users.length >= 1) {
                    return res.status(200).send({ message: 'El usuario que intentas registrar ya existe' });
                } else {

                    //encriptación de contraseña
                    bcrypt.hash(params.password, null, null, (error, hash) => {
                        user.password = hash;

                        user.save((error, userStored) => {
                            if (error) return res.status(500).send({ message: 'Error al guardar el usuario' })

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

        await User.findOne({ email: email }, (error, user) => {
            if (error) return res.status(500).send({ message: 'Error en la peticion' });

            if (user) { //si la password que nosotros mandamos es igual a la encriptada
                bcrypt.compare(password, user.password, (error, check) => {
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

    async getUser(req, res) {
        const userId = req.params.id;

        await User.findById(userId, (error, user) => {
            if (error) return res.status(500).send({ message: 'Error en la petición' });

            if (!user) return res.status(404).send({ message: 'El usuario no existe' });

            return res.status(200).send({ user });
        });
    },

    //devolver listado de usuarios paginados

    async getUsers(req, res) {
        //recogemos el id del usuario logueado en este momento
        const identity_user_id = req.user.id;

        let page = 1;
        if (req.params.page) {
            page = req.params.page;
        }
        //cantidad de usuarios logueados por pagina
        var itemsPerPage = 5;

        await User.find().sort('_id').paginate(page, itemsPerPage, (error, users, total) => {
            if (error) return res.status(500).send({ message: 'Error en la peticion' });

            if (!users) return res.status(404).send({ message: 'No hay usuarios disponibles' });

            return res.status(200).send({
                users,
                total,
                pages: Math.ceil(total / itemsPerPage) //saca el numero de paginas que van a existir
            });
        });
    },

    async update(req, res) {
        const userId = req.params.id;
        const update = req.body;

        //hay que borrar la password y actualizarla por separado
        delete update.password;

        if (userId != req.user.id) {
            return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' })
        }
        //busco usuario por id, le paso los datos a actualizar y el objeto modificado(new)
        await User.findByIdAndUpdate(userId, update, { new: true }, (error, userUpdated) => {
            if (error) return res.status(500).send({ message: 'Error en la peticion' });

            if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

            return res.status(200).send({ user: userUpdated })
        });
    },

    //imagen-avatar del usuario

    async uploadImage(req, res) {
        const userId = req.params.id;

        if (req.files) {
            const file_path = req.files.image.path //aqui sacamos el path de la imagen que queremos subir
            console.log(file_path);

            const file_split = file_path.split('\\'); //separamos los segmentos de la path en un array
            console.log(file_split);

            var file_name = file_split[2]; //seleccionamos la posicion 2 del array(nombre del archivo)
            console.log(file_name);

            const ext_split = file_name.split('\.'); //sacamos la extension del archivo para ver si es una imagen el archivo a subir
            console.log(ext_split);

            const file_ext = ext_split[1]; //seleccionamos la extension del fichero
            console.log(file_ext);

            //validacion de id para dejar cambiar la img
            if (userId != req.user.id) {
               return removeFilesOfUploads(res, file_path, 'No tienes permisos para actualizar los datos del usuario' );
            }

            if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
                // Actualizar el usuario con la imagen
                User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (error, userUpdated) => {
                    if (error) return res.status(500).send({ message: 'Error en la peticion' });

                    if (!userUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
        
                    return res.status(200).send({ user: userUpdated })
                });
            } else {
                return removeFilesOfUploads(res, file_path, 'Extension no valida' );
            }

        } else {
            return res.status(200).send({ message: 'No se han subido imagenes' });
        }
    },

    //devolver la imagen de un usuario
    async getImageFile(req, res) {
        const imageFile = req.params.imageFile;
        const pathFile = './uploads/users/' + imageFile;

        fs.exists(path_file, (exists) => {
            if(exists){
                res.sendFile(path.resolve(path_file));
            } else {
                res.status(200).send({message: 'No existe la imagen'});
            }
        })
    }

}
//funcion para remover imagenes no validas
function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (error) => {
        return res.status(200).send({ message: message });
    });
}
module.exports = UserController;