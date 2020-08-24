'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta_token';

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La peticion no tiene el header authentication'})
    }

    const token = req.headers.authorization.replace(/['"]+/g, ''); //le quitamos las comillas al token

    try {
        var payload = jwt.decode(token, secret);

        //si la fecha del token es menor a la actual, expira el token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
        
    } catch (ex) {
        return res.status(404).send({
            message: 'El token no es válido'
        });
    }

    req.user = payload;

    next();
}