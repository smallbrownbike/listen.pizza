var searchAlbumList = document.getElementById('searchAlbumList'),
    title = document.getElementsByTagName('h7'),
    expandSymbolArtist = document.getElementById('expandSymbolArtist'),
    expandSymbolAlbum =document.getElementById('expandSymbolAlbum'),
    expandArtist = document.getElementById('expandArtist'),
    info = document.getElementById('bio'),
    expandAlbum = document.getElementById('expandAlbum');

/// media query
if (matchMedia) {
  var mq = window.matchMedia("(min-width: 650px)");
  mq.addListener(WidthChange);
  WidthChange(mq);
}

function WidthChange(mq) {
  if (mq.matches) {
    searchAlbumList.setAttribute('class', 'ui four cards')
		similarArtistColumns.setAttribute('class', 'ui four column grid')
  } else {
    searchAlbumList.setAttribute('class', 'ui two cards')
		similarArtistColumns.setAttribute('class', 'ui two column grid')
  }
}


////

///top albums request
function topAlbumsListener(){
  console.log(JSON.parse(this.responseText))
	showTopAlbums(JSON.parse(this.responseText))
}
var params = {
	tagAlbum: window.location.pathname.slice(5)
}
var xhr = new XMLHttpRequest();
xhr.onload = topAlbumsListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function showTopAlbums(data){
	// pageTitle.textContent = data.topalbums['@attr'].artist;
	var html = ''
	
	for(var i=0;i<8;i++){
		var image;
		var artist = data.albums.album[i].artist.name;
		var album = data.albums.album[i].name;
		if(data.albums.album[i].image[3]['#text']){
			image = data.albums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		html += "<div id='card' class='searchAlbumCard ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist).replace(/[!'()*]/g, escape) + '+' + encodeURIComponent(album).replace(/[!'()*]/g, escape) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><a href=/artist/" + encodeURIComponent(artist) + "><h4 id='cardArtist'>" + artist + "</h4></a><h7>" + album + "</h7></div></div>"
	}
	
	searchAlbumList.innerHTML = html;
	for(var i=0; i < title.length; i++){
		if(title.item(i).textContent.length > 28){
			title.item(i).textContent = title.item(i).textContent.slice(0, 25) + '...'
		}
	}
	var expandState = '';
	for(var i=8;i<48;i++){
		var image;
		var artist = data.albums.album[i].artist.name;
		var album = data.albums.album[i].name;
		if(data.albums.album[i].image[3]['#text']){
			image = data.albums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		expandState += "<div id='hiddenCards' class='ui card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist).replace(/[!'()*]/g, escape) + '+' + encodeURIComponent(album).replace(/[!'()*]/g, escape) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><a href=/artist/" + encodeURIComponent(artist) + "><h4 id='cardArtist'>" + artist + "</h4></a><h7>" + album + "</h7></div></div>"
	}
	var currentState;
	currentState = searchAlbumList.innerHTML;
	expandAlbum.addEventListener('click', (e) => {
		if(expandSymbolAlbum.textContent === '+'){
			expandSymbolAlbum.textContent = '-';
			searchAlbumList.innerHTML += expandState;
		} else {
			expandSymbolAlbum.textContent = '+';
			searchAlbumList.innerHTML = currentState;
		}
	})
}

/////

///top artists request
function similarListener(){
	var arr = JSON.parse(this.responseText);
  console.log(arr)
  generateTagArtists(arr)
}
var params = {
	tagArtist: window.location.pathname.slice(5)
}
var xhr = new XMLHttpRequest();
xhr.onload = similarListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function generateTagArtists(data){
  data = data.topartists.artist;
  for(var i=0;i<8;i++){
		if(data[i].image[3]['#text']){
		var image = data[i].image[3]['#text'];
		} else {
			var image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg'
		}
		var name = data[i].name;
		similarArtistColumns.innerHTML += "<div id='similarArtistColumn' class='column'><div id='similarArtistCard' class='ui card'><a id='imageContainer' href='/artist/" + encodeURIComponent(name.replace('/', ' ')) + "' class='image'><img id='similarImage' src='" + image + "'><div id='similarArtistContainer' class='ui text container'><div id='similarArtistName'>" + name + "</div></div></a></div></div>";
	}
  var expandState = '';
	for(var i=8;i<48;i++){
    if(data[i].image[3]['#text']){
    var image = data[i].image[3]['#text'];
    } else {
      var image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg'
    }
		var name = data[i].name;
		expandState += "<div id='similarArtistColumn' class='column'><div id='similarArtistCard' class='ui card'><a id='imageContainer' href='/artist/" + encodeURIComponent(name.replace('/', ' ')) + "' class='image'><img id='similarImage' src='" + image + "'><div id='similarArtistContainer' class='ui text container'><div id='similarArtistName'>" + name + "</div></div></a></div></div>";
	}
	var currentStateArtist = similarArtistColumns.innerHTML;
	expandArtist.addEventListener('click', (e) => {
		if(expandSymbolArtist.textContent === '+'){
			expandSymbolArtist.textContent = '-';
			similarArtistColumns.innerHTML += expandState;
		} else {
			expandSymbolArtist.textContent = '+';
			similarArtistColumns.innerHTML = currentStateArtist;
		}
	})
}

/////

///info request

function infoListener(){
	var arr = JSON.parse(this.responseText);
  generateInfo(arr)
}
var params = {
	tagInfo: window.location.pathname.slice(5)
}
var xhr = new XMLHttpRequest();
xhr.onload = infoListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function generateInfo(data){
  var name = data.tag.name;
  var tagInfo = data.tag.wiki.summary;
  info.innerHTML = "<div class='ui text container'><h1 id='tagName'>#" + name + "</h1><div class='ui fitted divider'></div></div><div id='tagInfo' class='ui text container'>" + tagInfo + "</div>"
}