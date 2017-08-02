const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  email: String,
  token: String,
  created: Number,
  valid: Boolean
})

var Invite = mongoose.model('Invite', inviteSchema)

module.exports = Invite;