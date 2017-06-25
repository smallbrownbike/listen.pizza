const express = require('express'),
			hbs = require('express-handlebars').create({extname: '.hbs', defaultLayout: 'main', partialsDir: 'views/partials'}),
			bodyParser = require('body-parser'),
			mongoose = require('mongoose'),
			methodOverride = require('method-override'),
			request = require('request'),
			Album = require('./models/album'),
			User = require('./models/user'),
			app = express(),
			passport = require('passport'),
			redis = require('redis'),
			LocalStrategy = require('passport-local');

mongoose.connect(process.env.MONGO);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

client = redis.createClient(process.env.REDIS_URL);

//passport config
app.use(require('express-session')({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
})

///collection routes
app.get('/', isLoggedIn, (req, res) => {
	res.redirect('/collection')
});

app.get('/collection', isLoggedIn, (req, res) => {
	User.findOne({username: req.user.username}, (err, user) => {
		if(user.albums.length >= 1){
			User.aggregate({$match: {username: req.user.username}}, {$unwind: '$albums'}, {$sort: {'albums.added': -1}}, (err, album) => {
				if(err){
					console.log(err)
				} else {
					var albumDate = album[0].albums.added;
					if(Date.now() - albumDate > 300000){
						res.render('collection', {album: album, date: albumDate})
					} else {
						res.render('collection', {album: album})
					}
				}
			})
		} else {
			res.render('collection')
		}
	})
});

app.post('/collection', isLoggedIn, (req, res) => {
	User.findById(req.user._id, (err, foundUser) => {
		if(err){
			console.log(err)
		} else {
			foundUser.albums.push(req.body)
			foundUser.save();
		}
	})
})

app.delete('/collection/:id', isLoggedIn, (req, res) => {
	User.update(
		{username: req.user.username},
		{$pull: {albums: {_id: req.params.id}}}
	, (err, user) => {
		if(err){
			console.log(err)
		} else {
			res.redirect('/collection')
		}
	})
	})
	

///search routes
app.get('/artist', isLoggedIn, (req, res) => {
	res.redirect('/artist/search');
})

app.get('/artist/search', isLoggedIn, (req, res) => {
	res.render('search');
})

app.get('/artist/search/:query', isLoggedIn, (req, res) => {
	res.render('search');
})

app.get('/album', isLoggedIn, (req, res) => {
	res.redirect('/artist/search');
})

app.get('/album/:name', isLoggedIn, (req, res) => {
	let arr;
	arr = req.params.name.split('+');
	User.findOne(
		{username: req.user.username},
		{albums: {$elemMatch: {title: decodeURIComponent(arr[1])}}}
	, (err, album) => {
		if(err){
			console.log(err)
		} 
		if(album.albums[0]){
			res.render('showAlbum', {album: album.albums[0].title})
		} else {
			res.render('showAlbum')
		}		
	})
})

///auth routes
app.get('/register', isLoggedInLogin, (req, res) => {
	res.render('registerClosed')
})

app.get('/login', isLoggedInLogin, (req, res) => {
	res.render('login')
})

app.post('/login', isLoggedInLogin, passport.authenticate('local', {successRedirect: '/collection', failureRedirect: 'login'}), (req, res) => {
	
});

app.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	res.redirect('/login')
})

///api route
app.post('/api', isLoggedIn, (req, res) => {
	if(req.body.topAlbums){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=' + req.body.topAlbums + '&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.topTracks){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=' + req.body.topTracks +  '&limit=10&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.similarRandom){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' + req.body.similarRandom +  '&limit=20&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.similar){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + req.body.similar +  '&limit=50&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.albumInfo){
		var artist = req.body.albumInfo[0];
		var album = req.body.albumInfo[1];
		request('https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=' + process.env.LASTKEY + '&artist=' + artist + '&album=' + album +'&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.youtubecache){
		client.lrange(req.body.youtubecache[0], 0, -1, (err, reply) => {
			if(err){
				console.log(err)
			} else if(reply.length > 0){
				res.send(reply)
			} else {
				res.send(JSON.stringify('youtube'))
			}
		})
		
	}
	if(req.body.youtube){
		var arr = req.body.youtube.split(' ');
		if(arr.length > 2){
			var artist = decodeURIComponent(arr[0])
			var album = decodeURIComponent(arr[1])
			var song = decodeURIComponent(arr[2])
			request('https://www.googleapis.com/youtube/v3/search?q=' + encodeURIComponent(artist + ' ' + song) + '&maxResults=1&part=snippet&key=' + process.env.YOUKEY, function (error, response, body) {
				if(error){
					console.log(error)
				} else {
					body = JSON.parse(body)
					if(body.items[0].id.kind !== 'youtube#video'){
						client.rpush(artist + ' ' + album, song + '+notfound')
						res.send(JSON.stringify('notfound'))
					} else {
						client.rpush(artist + ' ' + album, song + '+' + body.items[0].id.videoId)
						res.send(JSON.stringify(body.items[0].id.videoId));
					}
				}
			});
		} else {
			var artist = decodeURIComponent(arr[0])
			var song = decodeURIComponent(arr[1])
			request('https://www.googleapis.com/youtube/v3/search?q=' + encodeURIComponent(artist + ' ' + song) + '&maxResults=1&part=snippet&key=' + process.env.YOUKEY, function (error, response, body) {
				if(error){
					console.log(error)
				} else {
					body = JSON.parse(body)
					if(body.items[0].id.kind !== 'youtube#video'){
						client.rpush(artist, song + '+notfound')
						res.send(JSON.stringify('notfound'))
					} else {
						client.rpush(artist, song + '+' + body.items[0].id.videoId)
						res.send(JSON.stringify(body.items[0].id.videoId));
					}
				}
			});
		}
	}
})

app.get('*', (req, res) => {
	res.render('404')
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login')
}

function isLoggedInLogin(req, res, next){
	if(req.isAuthenticated()){
		res.redirect('/collection')
	} else {
		return next();
	}
}

app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server running')
});
// app.listen('3000', function(){
// 	console.log('Server running')
// });