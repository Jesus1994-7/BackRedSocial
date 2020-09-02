'use strict'

const path = require('path');
const fs = require('fs');
const moment = require('moment');
const mongoosePage = require('mongoose-pagination');

const Publication = require('../models/publication');
const User = require('../models/user');
const Follow = require('../models/follow');
const publication = require('../models/publication');

function savePublication(req, res) {
    const params = req.body;

    if (!params.text) {
        return res.status(200).send({ message: 'Debes enviar un texto' });

    }
    const publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.id;
    publication.created_at = moment().unix()

    publication.save((err, publication) => {
        if (err) return res.status(500).send({ message: 'Error al guardar la publicacion' });

        if (!publication) return res.status(404).send({ message: 'La publicacion no ha sido guardada' });

        return res.status(200).send({ publication: publication });
    })
}

//conseguir publicaciones de usuarios que seguimos
function getPublications(req, res) {
    let page = 1;
    if (req.params.page) { //si cambiamos de pagina se sustituye el valor
        page = req.params.page;
    }

    var itemsPerPage = 4;
    //sustituimos la propiedad id por la de followed
    Follow.find({ user: req.user.id }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({ message: 'Error al devolver el seguimiento' });

        const follows_clean = [];
        //primero metemos todos los usuarios que seguimos en un array
        follows.forEach((follow) => {
            follows_clean.push(follow.followed)
        });
        //y despues con este metodo buscamos todos los documentos cuyo usuario este dentro de follows_clean(array), ordeandos por fecha
        publication.find({ user: { "$in": follows_clean } }).sort('-created_at').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if (err) return res.status(500).send({ message: 'Error al devolver las publicaciones' });

            if (!publications) return res.status(404).send({ message: 'No hay publicaciones' });

            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total / itemsPerPage),
                page: page,
                publications
            });
        });

        console.log(follows_clean)
    });
}
//conseguir publicacion por id
function getPublication(req, res) {
    const publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if (err) return res.status(500).send({ message: 'Error al devolver la publicacion' });

        if (!publication) return res.status(500).send({ message: 'No existe la publicacion' });

        res.status(200).send({ publication });
    });
}
//eliminar publicacion 

function deletePublication(req, res) {
    const publicationId = req.params.id;
    //Buscamos el usuario de la publicacion y la id de la publicacion a eliminar
    Publication.find({ 'user': req.user.id, '_id': publicationId }).remove((err, publicationRemoved) => {
        if (err) return res.status(500).send({ message: 'Error al eliminar la publicacion' });

        if (!publicationRemoved) return res.status(500).send({ message: 'No se ha borrado la publicacion' });

        return res.status(200).send({ message: 'Publicacion eliminada' });
    })
}

//subir imagen a la publicacion
function uploadImage(req, res) {
    const publicationId = req.params.id;

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

        //extensiones del archivo
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // Actualizar el documento con la imagen

            //primero buscamos que la publicacion sea tuya para no poder modificar cualquiera
            Publication.findOne({ 'user': req.user.id, '_id': publicationId }).exec((err, publication) => {
                if (publication) {

                    Publication.findByIdAndUpdate(publicationId, { file: file_name }, { new: true }, (error, publicationUpdated) => {
                        if (error) return res.status(500).send({ message: 'Error en la peticion' });

                        if (!publicationUpdated) return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });

                        return res.status(200).send({ publication: publicationUpdated })
                    });
                } else {
                    return removeFilesOfUploads(res, file_path, 'No tienes permiso para actualizar la publicacion');

                }
            })

        } else {
            return removeFilesOfUploads(res, file_path, 'Extension no valida');
        }

    } else {
        return res.status(200).send({ message: 'No se han subido imagenes' });
    }
}
//funcion para remover imagenes no validas
function removeFilesOfUploads(res, file_path, message) {
    fs.unlink(file_path, (error) => {
        return res.status(200).send({ message: message });
    });
}

//devolver imagen
function getImageFile(req, res) {
    const imageFile = req.params.imageFile;
    const pathFile = './uploads/publications/' + imageFile;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    })
}


module.exports = {
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFile
}