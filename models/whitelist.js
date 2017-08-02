const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
  username: String,
  token: String,
  created: Number
})

var Whitelist = mongoose.model('Whitelist', whitelistSchema)

module.exports = Whitelist;