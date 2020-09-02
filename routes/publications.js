'use strict'

const router = require('express').Router();
const PublicationController = require('../controllers/publication');
const auth = require('../middlewares/auth');

const multipart = require('connect-multiparty');
const upload = multipart({ uploadDir: './uploads/publications'});


router.post('/publication', auth, PublicationController.savePublication);

module.exports = router;