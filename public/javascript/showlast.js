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
var cleanId = [];

///////////////////////////////////////////


///album request
function albumInfoListener(){
	generateContent(JSON.parse(this.responseText))
}
var params = {
	albumInfo: window.location.pathname.slice(7).split('+')
}
var xhr = new XMLHttpRequest();
xhr.onload = albumInfoListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));
////

///main content generation/youtube request
function generateContent(data) {
	if(add.textContent.trim() !== data.album.name){
		add.style.display = 'block';
		add.innerHTML = '<div id="addButton" class="ui basic green button" data="" data-tooltip="Add this album to your collection!" data-position="top center">Add</div>';
		var addButton = document.getElementById('addButton');
		addButton.addEventListener('click', (e) =>{
			add.style.display = 'none';
			var xhr = new XMLHttpRequest();
			var params = {
				added: Date.now(),
				title: data.album.name,
				artist: data.album.artist,
				image: data.album.image[3]['#text']				
			};
			xhr.open("POST", "/collection", true); ///<----- test nothing here
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(params));
		})
	}
	artist.innerHTML = '<a href="/artist/search/' + encodeURIComponent(data.album.artist) + '">' + data.album.artist + '</a> - ';
	album.textContent = data.album.name;
	
	title.textContent = artist.textContent + album.textContent;
	var img = data.album.image[3]['#text'];
	
	image.innerHTML = '<img class="ui image" src="' + img + '">';
	bg.style.backgroundImage = 'url(' + img + ')';
	data.album.tags.tag.forEach((i) => {
		tags.innerHTML += '<a target="_blank" id="tag" href="' + i.url + '" class="ui tag label">' + i.name + '</a>'
	})
	if(data.album.wiki){
		summary = data.album.wiki.summary;
		review.innerHTML = summary;
	}
	if(data.album.tracks.track.length > 0){
		data.album.tracks.track.forEach((i) => {
			tracks.push(i.name)
		});
		var html = '<tbody>'
		for(var i=0; i<tracks.length; i++){
			html += '<div class="ui text container"><tr><td id="trackName">' + tracks[i]  + '<button id="yt" class="ui small basic disabled button">Listen</button>' + '</td></tr></div>'
		}
		playlist.innerHTML = "<a id='playButton' class='ui basic disabled button'>Play All</a>"
		html+='</tbody>'
		table.innerHTML = html;
		trackName = document.querySelectorAll('#trackName');

		youtubecache();

		function youtube(i){
			if(i<tracks.length){
				var search = encodeURIComponent(data.album.artist) +  ' ' + encodeURIComponent(data.album.name) + ' ' + encodeURIComponent(tracks[i]);

				function youtubeListener(){
					generateYoutube(JSON.parse(this.responseText), i, false)
				}
				var params = {
					youtube: search
				}
				var xhr = new XMLHttpRequest();
				xhr.onload = youtubeListener;
				xhr.open('POST', '/api');
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(params));
			} else {
				return;
			}
		};

		function youtubecache(){
			tracks.unshift(data.album.artist + ' ' + data.album.name)
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
				if(data === 'notfound'){
					trackName.item(i).innerHTML = tracks[i] + '<button id="yt" class="ui small basic grey disabled button">Listen</button>';
					id.push(undefined);
				} else {
					trackName.item(i).innerHTML = tracks[i] + '<a target="_blank" id="yt" class="ui small basic blue button" href="https://www.youtube.com/watch?v=' + data + '">Listen</a>'
					id.push(data)
				}
				if(cache === false){
					youtube(id.length)
				}
				if(id.length === tracks.length){
					var cleanId = [];
					for(var i=0; i<id.length;i++){
						if(id[i] !== undefined){
							cleanId.push(id[i])
						}
					}
					playlist.innerHTML = "<a target='_blank' href='http://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "' id='playButton' class='ui basic blue button'>Play All</a>";
				}
			};
			
	} else {
		table.innerHTML = '<div class="ui negative message"></i><div class="ui center aligned container">Darn! We couldn\'t find the tracklist for <strong>' + data.album.artist + '-' + data.album.name + '</strong>.</div></div>'
	}
};