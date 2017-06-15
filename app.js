const express = require('express'),
			hbs = require('express-handlebars').create({extname: '.hbs', defaultLayout: 'main', partialsDir: 'views/partials'}),
			bodyParser = require('body-parser'),
			mongoose = require('mongoose'),
			methodOverride = require('method-override'),
			Album = require('./models/album'),
			User = require('./models/user'),
			app = express(),
			passport = require('passport'),
			LocalStrategy = require('passport-local');


mongoose.connect('mongodb://localhost/the_jangle_index');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

//passport config
app.use(require('express-session')({
	secret: '***REMOVED***',
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

app.get('/', isLoggedIn, (req, res) => {
	res.redirect('/collection')
});

///collection routes

app.get('/collection', isLoggedIn, (req, res) => {
	console.log(req.user.username)
	User.aggregate({$match: {username: req.user.username}}, {$unwind: '$albums'}, {$sort: {'albums.added': -1}}, (err, album) => {
		if(err){
			console.log(err)
		} else {
			res.render('collection', {album: album})
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
		{albums: {$elemMatch: {title: decodeURI(arr[1])}}}
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

app.get('/register', isLoggedInLogin, (req, res) => {
	res.render('registerClosed')
})

/*app.post('/register', isLoggedInLogin, (req, res) => {
	var newUser = new User({email: req.body.email, username: req.body.username});
	User.register(newUser, req.body.password, (err, user) => {
		if(err){
			console.log(err)
			return res.render('register')
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/collection')
		})
	})
})*/

app.get('/login', isLoggedInLogin, (req, res) => {
	res.render('login')
})

app.post('/login', isLoggedInLogin, passport.authenticate('local', {successRedirect: '/collection', failureRedirect: 'login'}), (req, res) => {
	
});

app.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	res.redirect('/login')
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