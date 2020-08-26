'use strict'

const router = require('express').Router();
const FollowController = require('../controllers/follow');

const auth = require('../middlewares/auth');

router.post('/follow', auth, FollowController.followed);
router.delete('/follow/:id', auth, FollowController.unfollow);
router.get('/following/:id?/:page?', auth, FollowController.getFollows);
router.get('/followed/:id?/:page?', auth, FollowController.getFollowed);


module.exports = router;
