var mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
	title: String,
	artist: String,
	image: String,
	added: String
});

var Album = mongoose.model('Album', albumSchema);
//

module.exports = Album;