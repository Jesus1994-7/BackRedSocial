'use strict'

const router = require('express').Router();
const FollowController = require('../controllers/follow');

const auth = require('../middlewares/auth');

router.post('/follow', auth, FollowController.followed);


module.exports = router;
