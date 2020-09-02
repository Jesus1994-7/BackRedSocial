'use strict'

const router = require('express').Router();
const auth = require('../middlewares/auth');
const MessageController = require('../controllers/message');

router.post('/message', auth, MessageController.doMessage);
router.get('/my-message', auth, MessageController.myRecivedMessages);
router.get('/messages', auth, MessageController.myEmittedMessages);
module.exports = router;