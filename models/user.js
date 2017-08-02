var mongoose = require('mongoose'),
		passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	name: String,
	username: String,
	password: String,
	invites: Number,
	albums: [
		{
			added: String,
			title: String,
			artist: String,
			image: String,
			artistImage: String
		}
	]
})

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model('User', userSchema)

module.exports = User;