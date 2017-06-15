const container = document.getElementById(''),
title = document.getElementsByTagName('h7');

if (matchMedia) {
  var mq = window.matchMedia("(min-width: 500px)");
  mq.addListener(WidthChange);
  WidthChange(mq);
}

// media query change
function WidthChange(mq) {
  if (mq.matches) {
    albumList.setAttribute('class', 'ui four cards')
  } else {
    albumList.setAttribute('class', 'ui two cards')
  }
}

function searchListener(){
	var arr = JSON.parse(this.responseText);
	showContent(arr);
	
}

function searchError(err){
	console.log(err)
}


var xhr = new XMLHttpRequest();
xhr.onload = searchListener;
xhr.onerror = searchError;
xhr.open('get', 'http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=' + decodeURI(window.location.pathname.slice(15)) + '&api_key=***REMOVED***&format=json');
xhr.send();

function showContent(data){
	var html = ''
	
	for(var i=0;i<48;i++){
		var image;
		var artist = data.topalbums.album[i].artist.name.replace(/[!'()*]/g, escape);
		var album = data.topalbums.album[i].name.replace(/[!'()*]/g, escape);
		if(data.topalbums.album[i].image[3]['#text']){
			image = data.topalbums.album[i].image[3]['#text']
		} else {
			image = 'https://s-media-cache-ak0.pinimg.com/originals/b8/9d/17/b89d17a8d96248e8ce344de075372c24.jpg';
		}
		
		html += "<div id='card' class='card'><a class='image' id='imageContainer' href='/album/" + encodeURIComponent(artist) + '+' + encodeURIComponent(album) + "'><img id='image' class='img' src='" + image + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + decodeURI(artist) + "</h4><h7>" + decodeURI(album) + "</h7></div></div>"
	}
	
	albumList.innerHTML = html;
	for(var i=0; i < title.length; i++){
	if(title.item(i).textContent.length > 28){
		title.item(i).textContent = title.item(i).textContent.slice(0, 25) + '...'
	}
}
}