'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' }, 
    followed: { type: Schema.ObjectId, ref: 'User'} //provienen del model User
});

module.exports = mongoose.model('Follow', FollowSchema);