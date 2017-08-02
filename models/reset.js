const mongoose = require('mongoose');

const resetSchema = new mongoose.Schema({
  username: String,
  token: {type: String, unique: true},
  created: Number,
})

var Reset = mongoose.model('Reset', resetSchema)

module.exports = Reset;