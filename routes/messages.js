'use strict'

const router = require('express').Router();
const auth = require('../middlewares/auth');
const MessageController = require('../controllers/message');
const { route } = require('./users');

router.get('/probando', auth, MessageController.prueba)

module.exports = router;