const mongoose = require('mongoose');

const inviteRequestSchema = new mongoose.Schema({
  email: String,
})

var InviteRequest = mongoose.model('inviteRequest', inviteRequestSchema)

module.exports = InviteRequest;