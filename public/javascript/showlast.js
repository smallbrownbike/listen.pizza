var tags = document.getElementById('tags'),
title = document.querySelector('title'),
bg = document.getElementById('bg'),
loader = document.getElementById('loader'),
review = document.getElementById('review'),
playlist = document.getElementById('playlist');

var artist = document.getElementById('artist'),
add = document.getElementById('add'),
image = document.getElementById('image'),
album = document.getElementById('album');

var tracks = [];
var links = [];
var id = [];
var summary = '';
var string = '';

///////////////////////////////////////////



var lastAlbum = decodeURI(window.location.pathname.slice(7)).split('+');

table.innerHTML = '<tr><td><div class="ui center aligned container"><h4>Gathering songs...</h4><div id="loader" class="ui active centered inline loader"></div></td></tr>';

function generateContent(){
	var html = '<thead></thead><tbody>'
	for(var i=0; i<tracks.length; i++){
		if(links[i].includes('undefined')){
			html += '<div class="ui text container"><tr><td><strong>' + tracks[i] + '</strong></td></tr></div>'
		} else {
		html += '<div class="ui text container"><tr><td><strong>' + tracks[i] + '</strong> ' + links[i] + '</td></tr></div>'
		}
	}
	html+='</tbody>'
	table.innerHTML = html;
	
}

///track
function trackListener() {
	var arr = JSON.parse(this.responseText);
	
	if(add.textContent.trim() !== arr.album.name){
		add.style.display = 'block';
		add.innerHTML = '<div id="addButton" class="ui green button" data="" data-tooltip="Add this album to your collection!" data-position="top center">Add</div>';
		var addButton = document.getElementById('addButton');
		addButton.addEventListener('click', (e) =>{
			add.style.display = 'none';
			var xhr = new XMLHttpRequest();
			var params = {
				added: Date.now(),
				title: arr.album.name,
				artist: arr.album.artist,
				image: arr.album.image[3]['#text']				
			};
			xhr.open("POST", "/collection", true);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(params));
		})
	}
	artist.innerHTML = '<a href="/artist/search/' + arr.album.artist + '">' + arr.album.artist + '</a> - ';
	album.textContent = arr.album.name;
	///set page title
	
	title.textContent = artist.textContent + album.textContent;
	var img = arr.album.image[3]['#text'];
	///
	image.innerHTML = '<img class="ui image" src="' + img + '">';
	bg.style.backgroundImage = 'url(' + img + ')';
	arr.album.tags.tag.forEach((i) => {
		tags.innerHTML += '<a target="_blank" id="tag" href="' + i.url + '" class="ui tag label">' + i.name + '</a>'
	})
	if(arr.album.wiki){
		summary = arr.album.wiki.summary;
		review.innerHTML = summary;
	}
	if(arr.album.tracks.track.length > 0){
	arr.album.tracks.track.forEach((i) => {
		tracks.push(i.name)
	});
	getYoutube(0)
	} else {
		table.innerHTML = '<div class="ui negative message"></i><div class="ui center aligned container">Darn! We couldn\'t find the tracklist for <strong>' + arr.album.artist + '-' + arr.album.name + '</strong>.</div></div>'
	}
};

function trackError(err) {  
	console.log('Error: ', err);  
};

//youtube
function ytListener() {
	var arr = JSON.parse(this.responseText);
	if(arr.items.length === 0){
		links.push('undefined')
	} else {
	links.push('<a target="_blank" id="yt" class="ui small primary button" href="https://www.youtube.com/watch?v=' + arr.items[0].id.videoId + '">Listen</a>');
	id.push(arr.items[0].id.videoId)
	}
	getYoutube(links.length)
	if(links.length === tracks.length){
		var cleanId = []
		for(var i=0; i<id.length;i++){
			if(id[i] !== undefined){
				cleanId.push(id[i])
			}
		}
		playlist.innerHTML = "<a target='_blank' href='http://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "' id='playButton' class='ui primary button'>Play All</a>"
		table.innerHTML = '';
		
		generateContent();
	}
};

function ytError(err) {  
	console.log('Error: ', err);  
};

//initial request

var xhr = new XMLHttpRequest();
xhr.onload = trackListener;
xhr.onerror = trackError;
xhr.open('get', 'https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=***REMOVED***&artist=' + lastAlbum[0] + '&album=' + lastAlbum[1] +'&format=json');
xhr.send();
	
function youtube(i){
	var search = encodeURIComponent(artist.textContent + ' ' + tracks[i].replace('/', ' '));
	var xhr = new XMLHttpRequest();
	xhr.onload = ytListener;
	xhr.onerror = ytError;
	xhr.open('get', 'https://www.googleapis.com/youtube/v3/search?q=' + search + '&maxResults=1&part=snippet&key=AIzaSyBgCx9N47D4w1PoL9rC0YTvvxVU-PsDBEk');
	xhr.send();
}


function getYoutube(i){
	if(i<tracks.length){
		console.log('Getting tracks')
		youtube(i)
	} else {
		return;
	}
}



/*function reqListener() { 
	var arr = JSON.parse(this.responseText);
	makeUrl(arr)
};

function reqError(err) {  
	console.log('Error: ', err);  
};

var xhr = new XMLHttpRequest();
xhr.onload = reqListener;
xhr.onerror = reqError;
xhr.open('get', 'https://www.googleapis.com/youtube/v3/search?q=alex%20g%20bobby&maxResults=1&part=snippet&key=AIzaSyBgCx9N47D4w1PoL9rC0YTvvxVU-PsDBEk');
xhr.send();

function makeUrl(data){
	var id = data.items[0].id.videoId
	var url = 'https://www.youtube.com/watch?v=' + id;
	console.log(url)
}*/


/*
function makeUrl(data){
			var id = data.items[0].id.videoId
			var url = 'https://www.youtube.com/watch?v=' + id;
			console.log(url)*/