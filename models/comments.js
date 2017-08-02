var mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
  username: String,
  date: Number,
	comments: String
});

var Comments = mongoose.model('Comments', commentsSchema);


module.exports = Comments;