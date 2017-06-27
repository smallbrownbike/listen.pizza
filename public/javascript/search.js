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
title = document.getElementsByTagName('h7'),
trackName;
var yt;

////////

/// media query
if (matchMedia) {
  var mq = window.matchMedia("(min-width: 767px)");
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

///top albums request
function topAlbumsListener(){
	showTopAlbums(JSON.parse(this.responseText))
}
var params = {
	topAlbums: window.location.pathname.slice(8)
}
var xhr = new XMLHttpRequest();
xhr.onload = topAlbumsListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function showTopAlbums(data){
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
		html += "<div id='card' class='searchAlbumCard ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist).replace(/[!'()*]/g, escape) + '+' + encodeURIComponent(album).replace(/[!'()*]/g, escape) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + artist + "</h4><h7>" + album + "</h7></div></div>"
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
		expandState += "<div id='hiddenCards' class='ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist).replace(/[!'()*]/g, escape) + '+' + encodeURIComponent(album).replace(/[!'()*]/g, escape) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + artist + "</h4><h7>" + album + "</h7></div></div>"
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
	topTracks: window.location.pathname.slice(8)
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
		var html = '<tbody>'
		for(var i=0; i<5; i++){
			html += '<tr><td id="trackName">' + tracks[i] + '<button id="yt" class="ui small basic disabled button">Listen</button>' + '</td>'
			html += '<td id="trackName">' + tracks[i+5] + '<button id="yt" class="ui small basic disabled button">Listen</button></td></tr>'
		}
		playlist.innerHTML = '<a class="grey">Play All</a>';
		html+='</tbody>';
		table.innerHTML = html;
		trackName = document.querySelectorAll('#trackName')
		yt = document.querySelectorAll('#yt');
		
		youtubecache()
	}

	function youtube(i){
		if(i<tracks.length){
			function youtubeListener(){
				generateYoutube(JSON.parse(this.responseText), i, false)
			}
			var params = {
				youtube: window.location.pathname.slice(8) + ' ' + encodeURIComponent(tracks[i])
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


	function youtubecache(){
		tracks.unshift(decodeURIComponent(window.location.pathname.slice(8)))
		function youtubeListener(){
			if(JSON.parse(this.responseText) === 'youtube'){
				tracks.shift()
				youtube(0)
			} else {
				tracks.shift()
				generateYoutubeCache(JSON.parse(this.responseText))
			}
			// generateYoutube(JSON.parse(this.responseText), i)
		}
		var params = {
			youtubecache: tracks
		}
		var xhr = new XMLHttpRequest();
		xhr.onload = youtubeListener;
		xhr.open('POST', '/api');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(params));
	}

	function generateYoutubeCache(data){
		var youtubeSongs = {}
		data.forEach((i) => {
			var index = tracks.indexOf(i.split('+')[0])
			var id = i.split('+')[1]
			generateYoutube(id, index, true)
		})
	}

	var id = [];
	function generateYoutube(data, i, cache) {
		var numbers = [0,2,4,6,8,1,3,5,7,9]
		if(data === 'notfound'){
			trackName.item(numbers[i]).innerHTML = tracks[i] + '<button id="yt" class="ui small basic grey disabled button">Listen</button>'
			id.push(undefined)
		} else {
			trackName.item(numbers[i]).innerHTML = tracks[i] + '<a target="_blank" id="yt" class="ui small basic blue button" href="https://www.youtube.com/watch?v=' + data + '">Listen</a>';
			id.push(data)
		}
		if(cache === false){
			youtube(id.length)
		}
		if(id.length === tracks.length){
			var cleanId = []
			for(var i=0; i<id.length;i++){
				if(id[i] !== undefined){
					cleanId.push(id[i])
				}
			}
			playlist.innerHTML = "<a id='playList' target='_blank' href='https://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "'>Play All</a>";
		}
	};
}

////

///similar request

function similarListener(){
	var arr = JSON.parse(this.responseText);
	generateSimilar(arr.artist.similar.artist);
	generateBio(arr.artist);
}
var params = {
	similar: window.location.pathname.slice(8)
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
	
	artistBio.innerHTML = "<div class='ui circular image'><img src='" + image + "'></div><div class='ui text container'><h1 id='artistTitle'>" + name + "</h1><div class='ui fitted divider'></div></div><div id='artistSummary' class='ui text container'>" + bio + "</div><div id='tags' class='ui center aligned container'></div>"
	data.tags.tag.forEach((i) => {
		tags.innerHTML += '<a id="tag" href="/tag/' + encodeURIComponent(i.name) + '" class="ui tag label">' + i.name + '</a>'
	})
}

function generateSimilar(data){
	data.forEach((i) => {
		if(i.image[3]['#text']){
		var image = i.image[3]['#text'];
		} else {
			var image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg'
		}
		var name = i.name;
		similarArtistColumns.innerHTML += "<div id='similarArtistColumn' class='column'><div id='similarArtistCard' class='ui card'><a id='imageContainer' href='/artist/" + encodeURIComponent(name.replace('/', ' ')) + "' class='image'><img id='similarImage' src='" + image + "'><div id='similarArtistContainer' class='ui text container'><div id='similarArtistName'>" + name + "</div></div></a></div></div>";

	})
	similarArtistDiv.style.display = 'block';
}

