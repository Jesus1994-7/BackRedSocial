'use strict'

const router = require('express').Router();
const UserController = require('../controllers/user');

const auth = require('../middlewares/auth');

//middleware de subidas
const multipart = require('connect-multiparty');
//variable con middleware
const upload = multipart({uploadDir: './uploads/users'});

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/user/:id', auth.ensureAuth, UserController.getUser);
router.get('/users/:page?', auth.ensureAuth, UserController.getUsers);
router.put('/update-user/:id', auth.ensureAuth, UserController.update);
router.post('/upload-image/:id', [auth.ensureAuth, upload], UserController.uploadImage);
router.get('/get-image/:imageFile', UserController.getImageFile);

module.exports = router;