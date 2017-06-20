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

///song list loader
table.innerHTML = '<tr><td><div class="ui center aligned container"><h4>Gathering songs...</h4><div id="loader" class="ui active centered inline loader"></div></td></tr>';

///album request
function albumInfoListener(){
	console.log(this.responseText)
	generateContent(JSON.parse(this.responseText))
}
var params = {
	albumInfo: window.location.pathname.slice(7).split('+')
}
console.log(params.albumInfo)
var xhr = new XMLHttpRequest();
xhr.onload = albumInfoListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));
////

///main content generation/youtube request
function generateContent(data) {
	var arr = data;
	if(add.textContent.trim() !== arr.album.name){
		add.style.display = 'block';
		add.innerHTML = '<div id="addButton" class="ui basic green button" data="" data-tooltip="Add this album to your collection!" data-position="top center">Add</div>';
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
			xhr.open("POST", "/collection", true); ///<----- test nothing here
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(JSON.stringify(params));
		})
	}
	artist.innerHTML = '<a href="/artist/search/' + encodeURIComponent(arr.album.artist) + '">' + arr.album.artist + '</a> - ';
	album.textContent = arr.album.name;
	
	title.textContent = artist.textContent + album.textContent;
	var img = arr.album.image[3]['#text'];
	
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
		youtube(0);
		function youtube(i){
			if(i<tracks.length){
				var search = artist.textContent + ' ' + encodeURIComponent(tracks[i].replace('/', ' '));

				function youtubeListener(){
					generateYoutube(JSON.parse(this.responseText))
				}
				var params = {
					youtube: search
				}
				var xhr = new XMLHttpRequest();
				xhr.onload = youtubeListener;
				xhr.open('POST', '/api');
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.send(JSON.stringify(params));
			}
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
					for(var i=0; i<id.length;i++){
						if(id[i] !== undefined){
							cleanId.push(id[i])
						}
					}
					generateSongList();
				}
			};
			function generateSongList(){
				playlist.innerHTML = "<a target='_blank' href='http://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "' id='playButton' class='ui basic blue button'>Play All</a>"
				table.innerHTML = '';
				var html = '<tbody>'
				for(var i=0; i<tracks.length; i++){
					if(links[i].includes('undefined')){
						html += '<div class="ui text container"><tr><td id="trackName">' + tracks[i] + '</td></tr></div>'
					} else {
						html += '<div class="ui text container"><tr><td id="trackName">' + tracks[i] + ' ' + links[i] + '</td></tr></div>'
					}
				}
				html+='</tbody>'
				table.innerHTML = html;
			}
		}
	} else {
		table.innerHTML = '<div class="ui negative message"></i><div class="ui center aligned container">Darn! We couldn\'t find the tracklist for <strong>' + arr.album.artist + '-' + arr.album.name + '</strong>.</div></div>'
	}
};