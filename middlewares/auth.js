const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

const auth = async(req, res, next) => {
    try {
        const token = req.headers.authorization;
        jwt.verify(token, 'miSecretito');
        const user = await UserModel.findOne({
            tokens: token,
        })
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
            message: 'You are not authorized',
            error
        });
    }
}
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send({ message: "You don't have enough privilegies" })
    }
    next();
}
module.exports = auth, isAdmin;