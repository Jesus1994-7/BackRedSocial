'use strict'

const router = require('express').Router();
const PublicationController = require('../controllers/publication');
const auth = require('../middlewares/auth');

const multipart = require('connect-multiparty');
const upload = multipart({ uploadDir: './uploads/publications'});


router.post('/publication', auth, PublicationController.savePublication);
router.get('/publications/:page?', auth, PublicationController.getPublications);
router.get('/publication/:id', auth, PublicationController.getPublication);
router.delete('/publication/:id', auth, PublicationController.deletePublication);
router.post('/upload-image-publication/:id', [auth, upload], PublicationController.uploadImage);
router.get('/get-image/:imageFile', PublicationController.getImageFile);

module.exports = router;