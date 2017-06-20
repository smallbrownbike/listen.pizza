var container = document.getElementById(''),
searchAlbumList = document.getElementById('searchAlbumList'),
playlist = document.getElementById('playlistSearch'),
expand = document.querySelector('.expand'),
bg = document.getElementById('bg'),
table = document.getElementById('table'),
pageTitle = document.getElementById('title'),
artistBio = document.getElementById('bio'),
similarArtistDiv = document.getElementById('similarArtistDiv'),
similarArtistColumns = document.getElementById('similarArtistColumns'),
expandSymbol = document.getElementById('expandSymbol'),
title = document.getElementsByTagName('h7');

/// media query
if (matchMedia) {
  var mq = window.matchMedia("(min-width: 650px)");
  mq.addListener(WidthChange);
  WidthChange(mq);
}

function WidthChange(mq) {
  if (mq.matches) {
    searchAlbumList.setAttribute('class', 'ui four cards')
		similarArtistColumns.setAttribute('class', 'ui five column grid')
  } else {
    searchAlbumList.setAttribute('class', 'ui two cards')
		similarArtistColumns.setAttribute('class', 'ui two column grid')
  }
}
////

///song list loader
table.innerHTML = '<tr><td><div class="ui center aligned container"><h4>Gathering top songs...</h4><div id="loader" class="ui active centered inline loader"></div></td></tr>';
////

///top albums request
function topAlbumsListener(){
	showTopAlbums(JSON.parse(this.responseText))
}
var params = {
	topAlbums: decodeURIComponent(window.location.pathname.slice(15))
}
var xhr = new XMLHttpRequest();
xhr.onload = topAlbumsListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function showTopAlbums(data){
	pageTitle.textContent = data.topalbums['@attr'].artist;
	var html = ''
	
	for(var i=0;i<4;i++){
		var image;
		var artist = data.topalbums.album[i].artist.name;
		var album = data.topalbums.album[i].name;
		if(data.topalbums.album[i].image[3]['#text']){
			image = data.topalbums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		html += "<div id='card' class='searchAlbumCard ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist.replace(/[!'()*]/g, escape)) + '+' + encodeURIComponent(album.replace(/[!'()*]/g, escape)) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + artist + "</h4><h7>" + album + "</h7></div></div>"
	}
	
	searchAlbumList.innerHTML = html;
	for(var i=0; i < title.length; i++){
		if(title.item(i).textContent.length > 28){
			title.item(i).textContent = title.item(i).textContent.slice(0, 25) + '...'
		}
	}
	var expandState = '';
	for(var i=4;i<48;i++){
		var image;
		var artist = data.topalbums.album[i].artist.name;
		var album = data.topalbums.album[i].name;
		if(data.topalbums.album[i].image[3]['#text']){
			image = data.topalbums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		expandState += "<div id='hiddenCards' class='ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist.replace(/[!'()*]/g, escape)) + '+' + encodeURIComponent(album.replace(/[!'()*]/g, escape)) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + artist + "</h4><h7>" + album + "</h7></div></div>"
	}
	var currentState;
	currentState = searchAlbumList.innerHTML;
	expand.addEventListener('click', (e) => {
		if(expandSymbol.textContent === '+'){
			expandSymbol.textContent = '-';
			searchAlbumList.innerHTML += expandState;
		} else {
			expandSymbol.textContent = '+';
			searchAlbumList.innerHTML = currentState;
		}
	})
}
////

///top tracks request
function topTracksListener(){
	showTopTracks(JSON.parse(this.responseText))
}
var params = {
	topTracks: decodeURIComponent(window.location.pathname.slice(15))
}
var xhr = new XMLHttpRequest();
xhr.onload = topTracksListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function showTopTracks(data){
	var tracks = [];
	var img = data.toptracks.track[0].image[3]['#text'];
	bg.style.backgroundImage = 'url(' + img + ')';
	if(data.toptracks.track.length > 0){
		data.toptracks.track.forEach((i) => {
			tracks.push(i.name)
		});
		youtube(0)
	}
	function youtube(i){
		if(i<tracks.length){
			function youtubeListener(){
				generateYoutube(JSON.parse(this.responseText))
			}
			var params = {
				youtube: decodeURIComponent(window.location.pathname.slice(15) + ' ' + tracks[i].replace('/', ' '))
			}
			var xhr = new XMLHttpRequest();
			xhr.onload = youtubeListener;
			xhr.open('POST', '/api');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(params));
		} else {
			return;
		}
	}
	var links = [];
	var id = [];
	var cleanId = [];
	function generateYoutube(data) {
		var arr = data;
		if(arr.items.length === 0){
			links.push('undefined')
		} else {
		links.push('<a target="_blank" id="yt" class="ui small basic blue button" href="https://www.youtube.com/watch?v=' + arr.items[0].id.videoId + '">Listen</a>');
		id.push(arr.items[0].id.videoId)
		}
		youtube(links.length)
		if(links.length === tracks.length){
			var cleanId = []
			for(var i=0; i<id.length;i++){
				if(id[i] !== undefined){
					cleanId.push(id[i])
				}
			}
			playlist.innerHTML = "<a target='_blank' href='https://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "'>Play All</a>";
			table.innerHTML = '';
			generateSongList();
		}
	};
	function generateSongList(){
		var html = '<tbody>'
		for(var i=0; i<5; i++){
			if(links[i].includes('undefined')){
				html += '<tr><td id="trackName">' + tracks[i] + '</td>'
			} else {
				html += '<tr><td id="trackName">' + tracks[i] + ' ' + links[i] + '</td>'
			}
			if(links[i+5].includes('undefined')){
					html += '<td id="trackName">' + tracks[i+5] + '</td></tr>'
				} else {
					html += '<td id="trackName">' + tracks[i+5] + ' ' + links[i+5] + '</td></tr>'
				}
			}
		html+='</tbody>'
		table.innerHTML = html;
	}
}

////

///similar request

function similarListener(){
	var arr = JSON.parse(this.responseText);
	generateSimilar(arr.artist.similar.artist);
	generateBio(arr.artist);
}
var params = {
	similar: decodeURIComponent(window.location.pathname.slice(15))
}
var xhr = new XMLHttpRequest();
xhr.onload = similarListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function generateBio(data){
	
	if(data.image[3]['#text']){
		var image = data.image[3]['#text'];
		} else {
			var image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg'
		}
	var name = data.name;
	var bio = data.bio.summary;
	
	artistBio.innerHTML = "<div class='ui circular image'><img src='" + image + "'></div><div class='ui text container'><h1 id='artistTitle'>" + name + "</h1><div class='ui fitted divider'></div></div><div id='artistSummary' class='ui text container'>" + bio + "</div>"
}

function generateSimilar(data){
	data.forEach((i) => {
		if(i.image[3]['#text']){
		var image = i.image[3]['#text'];
		} else {
			var image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg'
		}
		var name = i.name;
		similarArtistColumns.innerHTML += "<div id='similarArtistColumn' class='column'><div id='similarArtistCard' class='ui card'><a id='imageContainer' href='/artist/search/" + encodeURIComponent(name.replace('/', ' ')) + "' class='image'><img id='similarImage' src='" + image + "'><div id='similarArtistContainer' class='ui text container'><div id='similarArtistName'>" + name + "</div></div></a></div></div>";
		
	})
	similarArtistDiv.style.display = 'block';
}