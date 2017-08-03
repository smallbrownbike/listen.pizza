const express = require('express'),
			path = require('path'),
			bodyParser = require('body-parser'),
			mongoose = require('mongoose'),
			request = require('request'),
			Album = require('./models/album'),
			User = require('./models/user'),
			Invite = require('./models/invite'),
			InviteRequest = require('./models/inviteRequest'),
			Whitelist = require('./models/whitelist'),
			Comments = require('./models/comments'),
			jwt = require('jsonwebtoken'),
			passport = require('passport'),
			expressJwt = require('express-jwt'),
			sg = require('sendgrid')(process.env.SENDGRID),
      helper = require('sendgrid').mail,
      uuidv4 = require('uuid/v4')
			LocalStrategy = require('passport-local');

app = express();
mongoose.connect(process.env.MONGO);
app.use(express.static(path.resolve(__dirname, 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()))
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
})

function lowercase(req, res, next){
	req.body.username = req.body.username.toLowerCase();
	next();
}
function checkWhitelist(req, res, next) {
	Whitelist.findOne({token: req.body.token}, (err, token) => {
		if(err){
			console.log(err)
		} else if(token && Date.now() - token.created < 3.6e+6){
			next();
		} else {
			res.json({valid: false})
		}
	})
}
function generateToken(req, res, next) {
	req.token = jwt.sign({
		username: req.user.username
	}, process.env.JWTSECRET, {
		expiresIn: '1h'
	});
	newWhitelist = new Whitelist({username: req.user.username, token: req.token, created: Date.now()})
	newWhitelist.save()
	next();
}

function serialize(req, res, next) {
	User.findOne({username: req.user.username}, (err, user) => {
		if(err){
			console.log(err)
		} else {
			req.user.name = user.name
		};
		next();
	})	
}

function respond(req, res) {
	res.status(200).json({
		name: req.user.name,
		username: req.user.username,
		token: req.token
	});
}

///api routes
app.post('/api/invitetoken', (req, res) => {
	Invite.findOne({token: req.body.token}, (err, invite) => {
		if(err){
			console.log(err)
		} else {
			if(invite && invite.valid && Date.now() - invite.created < 8.64e+7){
				res.json({valid: true, token: invite.token})
			} else {
				res.json({valid: false})
			}
		}
	})
})
app.post('/api/logout', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	Whitelist.findOneAndRemove({token: req.body.token}, (err, whitelist) => {
		if(err){
			console.log(err)
		} else if(whitelist){
			res.json({logout: true})
		}
	})
})
app.post('/api/deleteaccount', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	var newComments = new Comments({username: req.user.username, date: Date.now(), comments: req.body.comments})
	newComments.save()
	User.findOneAndRemove({username: req.user.username}, (err, user) => {
		if(err){
			console.log(err)
		} else {
			Whitelist.findOneAndRemove({token: req.body.token}, (err, whitelist) => {
				if(err){
					console.log(err)
				} else if(whitelist){
					res.json({success: true})
				}
			})
		}
	})
})
app.post('/api/resettoken', checkWhitelist, (req, res) => {
	Whitelist.findOne({token: req.body.token}, (err, whitelist) => {
		if(err){
			console.log(err)
		} else {
			if(whitelist && Date.now() - whitelist.created < 3.6e+6){
				res.json({valid: true, username: whitelist.username, token: whitelist.token})
			} else {
				res.json({error: 'InvalidToken'})
			}
		}
	})
})
app.post('/api/login', lowercase, passport.authenticate(  
  'local', {
    session: false
}), serialize, generateToken, respond);
app.post('/api/add', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	User.findOne({username: req.user.username}, (err, user) => {
		if(err){
			console.log(err)
		} else {
			user.albums.push(req.body)
			user.save();
			res.json('done')
		}
	})
})
app.post('/api/checkcredentials', passport.authenticate(  
  'local', {
    session: false
}), (req, res) => {
	res.json({valid: true})
})
app.post('/api/forgot', (req, res) => {
	User.findOne({username: req.body.username.toLowerCase()}, (err, user) => {
		if(err){
			console.log(err)
		} else if(user){
			Whitelist.findOneAndRemove({username: req.body.username.toLowerCase()}, (err, removed) => {})
			var token = jwt.sign({
				username: req.body.username.toLowerCase(),
			}, process.env.JWTSECRET, {
				expiresIn: '1h'
			});
			var newWhitelist = new Whitelist({username: req.body.username.toLowerCase(), token: token, created: Date.now()})
			newWhitelist.save((err, whitelist) => {
				if(err){
					console.log(err)
				} else {
					var fromEmail = new helper.Email('noreply@listen.pizza');
					var toEmail = new helper.Email(req.body.username);
					var subject = 'Password reset request';
					var content = new helper.Content('text/html', 'Hey, ' + user.name + '!<p>We received a request to reset the password on your listen.pizza account.</p><p>If you didn\'t initiate this request, please disregard this email.</p><p>Otherwise, <a href="https://tunedout.herokuapp.com/reset/' + token + '">please click here to reset your password.</a></p><p>This link will be valid for 1 hour.</p>');
					var mail = new helper.Mail(fromEmail, subject, toEmail, content);
					var request = sg.emptyRequest({
						method: 'POST',
						path: '/v3/mail/send',
						body: mail.toJSON()
					});
					sg.API(request, function (error, response) {
						if (error) {
							console.log('Error response received');
						} else {
							res.json({success: req.body.username.toLowerCase()})
						}
					});
				}
			})
		} else {
			res.json({error: 'NoUser'})
		}
	})
})
app.post('/api/requestinvite', (req, res) => {
	User.findOne({username: req.body.email}, (err, user) => {
		if(err){
			console.log(err)
		} else {
			if(user){
				res.json({error: 'UserExists'})
			} else {
				InviteRequest.findOne({email: req.body.email}, (err, invite) => {
					if(err){
						console.log(err)
					} else if (invite){
						res.json({error: 'EmailExists'})
					} else {
						var newInviteRequest = new InviteRequest({email: req.body.email})
						newInviteRequest.save((err, invite) => {
							if(err){
								res.json({error: err})
							} else {
								res.json({success: 'email saved'})
							}
						})
					}
				})
			}
		}
	})
})
app.post('/api/invite', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	User.findOne({username: req.user.username}, (err, currentUser) => {
		if(err){
			console.log(err)
		} else {
			if(currentUser.invites > 0){
				User.findOne({username: req.body.email.toLowerCase()}, (err, newUser) => {
					if(err){
						console.log(err)
					} else {
						if(newUser){
							res.json({error: 'UserExists'})
						} else {
							Invite.findOne({email: req.body.email}, (err, invite) => {
								if(err){
									console.log(err)
								} else if (invite){
									res.json({error: 'EmailExists'})
								} else {
									var uuid = uuidv4()
									var newInvite = new Invite({email: req.body.email, token: uuid, created: Date.now(), valid: true})
									newInvite.save((err, invite) => {
										if(err){
											console.log(err)
										} else {
											var fromEmail = new helper.Email('noreply@listen.pizza');
											var toEmail = new helper.Email(req.body.email);
											var subject = 'You\'re in!';
											var content = new helper.Content('text/html', 'You\'ve been invited to listen.pizza, a free music library powered by YouTube and Last.fm.<p><a href="http://tunedout.herokuapp.com/register/invite/' + uuid + '">Click here to create your free account</a></p><p>This invite will expire in 24 hours.</p>');
											var mail = new helper.Mail(fromEmail, subject, toEmail, content);
											var request = sg.emptyRequest({
												method: 'POST',
												path: '/v3/mail/send',
												body: mail.toJSON()
											});
											sg.API(request, function (error, response) {
												if (error) {
													console.log('Error response received');
												} else {
													User.findOneAndUpdate({username: req.user.username}, {$inc: {invites: -1}}, {new: true}, (err, userInvites) => {
														if(err){
															console.log(err)
														} else {
															res.json({success: 'Invited', email: req.body.email})
														}
													})
												}
											});
										}
									})
								}
							})
						}
					}
				})
			} else {
				res.json({error: 'OutOfInvites'})
			}
		}
	})
	
})
app.post('/api/register', (req, res) => {
	Invite.findOne({token: req.body.token}, (err, invite) => {
		if(err){
			console.log(err)
		} else {
			if(invite && invite.valid && Date.now() - invite.created < 8.64e+7){
				var newUser = new User({name: req.body.name, username: req.body.email.toLowerCase(), invites: 1});
				User.register(newUser, req.body.password, (err, user) => {
					if(err){
						console.log(err)
						res.status(400).json({
							error: err
						});
					} else {
						Invite.findOneAndUpdate({token: req.body.token}, {$set:{valid:false}}, {new: true}, (err, invite) => {
							if(err){
								console.log(err)
							} else {
								console.log(invite)
							}
						})
						res.status(200).json('userCreated')
					}
				})
			} else {
				res.json({error: 'InvalidToken'})
			}
		}
	})
})
app.post('/api/resetpassword', expressJwt({secret: process.env.JWTSECRET}), checkWhitelist, (req, res) => {
	User.findOne({username: req.user.username}, (err, user) => {
		if(err){
			console.log(err)
		} else {
			Whitelist.findOneAndRemove({token: req.body.token}, (err, whitelist) => {
				if(err){
					console.log(err)
				} else {
					user.setPassword(req.body.password, () => {
						user.save();
						res.json({success: true})
					})
				}
			})
		}
	})
})
app.post('/api/updateemail', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	User.findOne({username: req.user.username}, (err, user) => {
		if(err){
			console.log(err)
		} else if(req.user.username === req.body.username.toLowerCase()){
			res.json({error: 'Same'})
		} else {
			User.findOne({username: req.body.username.toLowerCase()}, (err, user) => {
				if(err){
					console.log(err)
				} else if(user){
					res.json({error: 'UserExists'})
				} else {
					User.findOneAndUpdate({username: req.user.username}, {$set:{username: req.body.username.toLowerCase()}}, {new: true}, (err,user) => {
						if(err){
							console.log(err)
						} else {
							req.token = jwt.sign({
								username: user.username
							}, process.env.JWTSECRET, {
								expiresIn: '1h'
							});
							Whitelist.findOneAndUpdate({username: req.user.username}, {username: user.username, token: req.token}, (err, whitelist) => {
								if(err){
									console.log(err)
								} else {
									res.json({
										name: user.name,
										username: user.username,
										token: req.token
									});
								}
							})
						}
					})
				}
			})
		}
	})
})
app.post('/api/updatename', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	User.findOne({username: req.user.username}, (err, user) => {
		if(err){
			console.log(err)
		} else if(user.name === req.body.name){
			res.json({error: 'Same'})
		} else {
			User.findOneAndUpdate({username: req.user.username}, {name: req.body.name}, {new: true}, (err, user) => {
				if(err){
					console.log(err)
				} else {
					req.user.name = user.name;
					res.json({
						name: user.name,
						username: user.username,
						token: req.body.token
					});
				}
			})
		}
	})
})
app.post('/api/delete', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	req.body.id.forEach((i) => {
		User.update(
			{username: req.user.username},
			{$pull: {albums: {_id: i}}},
		  (err, user) => {})
	})
	var albums = []
	User.findOne({username: req.user.username}, (err, user) => {
		User.aggregate({$match: {username: req.user.username}}, {$unwind: '$albums'}, {$sort: {'albums.added': -1}}, (err, album) => {
			if(err){
				console.log(err)
			} else {
				album.forEach((i) => {
					albums.push(i.albums)
				})
				res.json({albums: albums, invites: user.invites})
			}
		})
	})
})
app.post('/api/collection', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	var albums = []
	User.findOne({username: req.user.username}, (err, user) => {
		User.aggregate({$match: {username: req.user.username}}, {$unwind: '$albums'}, {$sort: {'albums.added': -1}}, (err, album) => {
			if(err){
				console.log(err)
			} else {
				album.forEach((i) => {
					albums.push(i.albums)
				})
				res.json({albums: albums, invites: user.invites})
			}
		})
	})
});
app.post('/api/album', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	User.findOne({username: req.user.username}, {albums: {$elemMatch: {title: req.body.title}}}, (err, album) => {
		if(err){
			console.log(err)
		} else {
			
		}
		if(album.albums[0]){
			if(album.albums[0].artist === req.body.artist){
				res.json({InCollection: 'yes', id: album.albums[0]['_id']})
			} else {
				res.json({InCollection: 'no'})
			}
		} else {
			res.json({InCollection: 'no'})
		}		
	})
})
app.post('/api/random', expressJwt({secret: process.env.JWTSECRET}), (req, res) => {
	var artists = []
	User.findOne({username: req.user.username}, (err, user) => {
		User.aggregate({$match: {username: req.user.username}}, {$unwind: '$albums'}, {$sort: {'albums.added': -1}}, (err, album) => {
			if(err){
				console.log(err)
			} else {
				album.forEach((i) => {
					if(artists.indexOf(i.albums.artist) < 0){
						artists.push(i.albums.artist)
					}
				})
				var randomNumber = Math.floor(Math.random() * (artists.length -1 ) + 1)
				var randomArtist = artists[randomNumber];
				getRandom(0)
				function getRandom(count){
					if(count <= 5){
						request('https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' + encodeURIComponent(randomArtist) +  '&limit=20&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
							if(error){
							} else {
								var randomNumber20 = Math.floor((Math.random() * 20 - 1) + 1);
								randomNewArtist = JSON.parse(body).similarartists.artist[randomNumber20].name
								if(artists.indexOf(randomNewArtist) < 0){
									res.json(JSON.stringify(randomNewArtist));
								} else {
									getRandom(count + 1)
								}
							}
						});
					} else {
						return
					}
				}
			}
		})
	})
});
app.post('/api/external', (req, res) => {
	if(req.body.isLoggedIn){
		if(req.isAuthenticated()){
			res.send(JSON.stringify('yes'))
		} else {
			res.send(JSON.stringify('no'))
		}
	}
	if(req.body.topAlbums){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=' + encodeURIComponent(req.body.topAlbums) + '&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.topTracks){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=' + encodeURIComponent(req.body.topTracks) +  '&limit=10&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
			if(error){
				console.log(error)
			} else {
				res.send(body);
			}
		});
	}
	if(req.body.tagInfo){
		request('http://ws.audioscrobbler.com/2.0/?method=tag.getinfo&tag=' + req.body.tagInfo + '&api_key=' + process.env.LASTKEY + '&format=json', function (err, response, body) {
			if(err){
				console.log(err)
			} else {
				res.send(body)
			}
		})
	}
	if(req.body.tagArtist){
		request('http://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=' + req.body.tagArtist + '&limit=48&api_key=' + process.env.LASTKEY + '&format=json', function (err, response, body) {
			if(err){
				console.log(err)
			} else {
				res.send(body)
			}
		})
	}
	if(req.body.tagAlbum){
		request('http://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=' + req.body.tagAlbum + '&limit=48&api_key=' + process.env.LASTKEY + '&format=json', function (err, response, body) {
			if(err){
				console.log(err)
			} else {
				res.send(body)
			}
		})
	}
	if(req.body.similar){
		request('https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=' + encodeURIComponent(req.body.similar) +  '&limit=50&api_key=' + process.env.LASTKEY + '&format=json', function (error, response, body) {
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
	if(req.body.youtube){
			var artist = req.body.youtube.artist
			var song = req.body.youtube.song
			request('https://www.googleapis.com/youtube/v3/search?q=' + encodeURIComponent(artist + ' ' + song) + '&maxResults=1&part=snippet&key=' + process.env.YOUKEY, function (error, response, body) {
				if(error){
				} else {
						body = JSON.parse(body)
						if(body.items.length > 0){
						if(body.items[0].id.kind !== 'youtube#video'){
							res.send(JSON.stringify('notfound'))
						} else {
							res.send(JSON.stringify(body.items[0].id.videoId));
						}
					} else {
						res.send(JSON.stringify('notfound'))
					}
				}
			});

	}
})
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});
app.listen(process.env.PORT, process.env.IP, function(){
	console.log('Server running')
});