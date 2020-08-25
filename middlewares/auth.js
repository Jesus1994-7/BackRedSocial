const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const auth = async(req, res, next) => {
    try {
        const token = req.headers.authorization;
        jwt.verify(token, 'miSecretito');
        const user = await UserModel.findOne({
            tokens: token,
        })
        console.log(user);
        if (!user) {
            return res.status(401).send({
                message: 'You are not authorized'
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error)
        return res.status(401).send({
            message: 'You are not authorizedd',
            error
        });
    }
}

module.exports = auth;