var container = document.getElementById(''),
searchAlbumList = document.getElementById('searchAlbumList'),
playlist = document.getElementById('playlist'),
expand = document.querySelector('.expand'),
bg = document.getElementById('bg'),
table = document.getElementById('table'),
expandSymbol = document.getElementById('expandSymbol'),
title = document.getElementsByTagName('h7');

if (matchMedia) {
  var mq = window.matchMedia("(min-width: 650px)");
  mq.addListener(WidthChange);
  WidthChange(mq);
}

// media query change
function WidthChange(mq) {
  if (mq.matches) {
    searchAlbumList.setAttribute('class', 'ui four cards')
  } else {
    searchAlbumList.setAttribute('class', 'ui two cards')
  }
}

table.innerHTML = '<tr><td><div class="ui center aligned container"><h4>Gathering top songs...</h4><div id="loader" class="ui active centered inline loader"></div></td></tr>';

function searchListener(){
	data = JSON.parse(this.responseText);
	showContent(data);
	
}

function searchError(err){
	console.log(err)
}


var xhr = new XMLHttpRequest();
xhr.onload = searchListener;
xhr.onerror = searchError;
xhr.open('get', 'https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=' + decodeURI(window.location.pathname.slice(15)) + '&api_key=***REMOVED***&format=json');
xhr.send();

function showContent(data){
	var html = ''
	
	for(var i=0;i<4;i++){
		var image;
		var artist = data.topalbums.album[i].artist.name.replace(/[!'()*]/g, escape);
		var album = data.topalbums.album[i].name.replace(/[!'()*]/g, escape);
		if(data.topalbums.album[i].image[3]['#text']){
			image = data.topalbums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		html += "<div id='card' class='searchAlbumCard ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist) + '+' + encodeURIComponent(album) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + decodeURI(artist) + "</h4><h7>" + decodeURI(album) + "</h7></div></div>"
	}
	
	searchAlbumList.innerHTML = html;
	for(var i=0; i < title.length; i++){
	if(title.item(i).textContent.length > 28){
		title.item(i).textContent = title.item(i).textContent.slice(0, 25) + '...'
	}
}
	for(var i=4;i<48;i++){
		var image;
		var artist = data.topalbums.album[i].artist.name.replace(/[!'()*]/g, escape);
		var album = data.topalbums.album[i].name.replace(/[!'()*]/g, escape);
		if(data.topalbums.album[i].image[3]['#text']){
			image = data.topalbums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		expandState += "<div id='hiddenCards' class='ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist) + '+' + encodeURIComponent(album) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + decodeURI(artist) + "</h4><h7>" + decodeURI(album) + "</h7></div></div>"
	}
	currentState = searchAlbumList.innerHTML;
}

var tracks = [];
function trackListener() {
	var arr = JSON.parse(this.responseText);
	var img = arr.toptracks.track[0].image[3]['#text'];
	bg.style.backgroundImage = 'url(' + img + ')';
	if(arr.toptracks.track.length > 0){
	arr.toptracks.track.forEach((i) => {
		tracks.push(i.name)
	});
	getYoutube(0)
	}
};

function trackError(err) {  
	console.log('Error: ', err);  
};


function generateContent(){
	var html = '<tbody>'
	for(var i=0; i<5; i++){
		if(links[i].includes('undefined')){
			html += '<tr><td><strong>' + tracks[i] + '</strong></td>'
		} else {
		html += '<tr><td><strong>' + tracks[i] + '</strong> ' + links[i] + '</td>'
		}
		
		if(links[i+5].includes('undefined')){
				html += '<td><strong>' + tracks[i+5] + '</strong></td></tr>'
			} else {
			html += '<td><strong>' + tracks[i+5] + '</strong> ' + links[i+5] + '</td></tr>'
			}
			
		}
	
	html+='</tbody>'
	table.innerHTML = html;
}

var links = [];
var id = [];
var cleanId = [];
function ytListener() {
	var arr = JSON.parse(this.responseText);
	if(arr.items.length === 0){
		links.push('undefined')
	} else {
	links.push('<a target="_blank" id="yt" class="ui small basic blue button" href="https://www.youtube.com/watch?v=' + arr.items[0].id.videoId + '">Listen</a>');
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
		playlist.innerHTML = "<a target='_blank' href='https://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "' id='playButton' class='ui basic blue button'>Play All</a>"
		table.innerHTML = '';
		generateContent();
	}
};

function ytError(err) {  
	console.log('Error: ', err);  
};

function youtube(i){
	var search = decodeURI(window.location.pathname.slice(15) + ' ' + tracks[i].replace('/', ' '));
	var xhr = new XMLHttpRequest();
	xhr.onload = ytListener;
	xhr.onerror = ytError;
	xhr.open('get', 'https://www.googleapis.com/youtube/v3/search?q=' + search + '&maxResults=1&part=snippet&key=***REMOVED***');
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

var xhr = new XMLHttpRequest();
xhr.onload = trackListener;
xhr.onerror = trackError;
xhr.open('get', 'https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=' + decodeURI(window.location.pathname.slice(15)) +  '&limit=10&api_key=***REMOVED***&format=json');
xhr.send();

var expandState = '';
var currentState;
expand.addEventListener('click', (e) => {
	if(expandSymbol.textContent === '+'){
		expandSymbol.textContent = '-';
		searchAlbumList.innerHTML += expandState;
	} else {
		expandSymbol.textContent = '+';
		searchAlbumList.innerHTML = currentState;
	}
})