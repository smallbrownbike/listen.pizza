
var title = document.getElementsByTagName('h7'),
artistList = document.getElementsByTagName('h4'),
image = document.getElementsByTagName('img'),
links = document.getElementsByTagName('a'),
added = document.getElementsByTagName('p'),
buttons = document.getElementById('buttons'),
edit = document.getElementById('edit'),
cardArtist = document.querySelectorAll('#cardArtist'),
cardTitle = document.querySelectorAll('#title');
imageContainer = document.querySelectorAll('#imageContainer'),
sortAndDelete = document.getElementById('sortAndDelete'),
trash = document.querySelectorAll('#trash'),
artistSort = document.getElementById('artistSort'),
segmentWrapper = document.getElementById('segmentWrapper');

var albums = []
var artists = []
var images = []
var addedOn =[]

var sortArtists = []
var sortAdded = []
var sortLowerCase = []

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

for(var i = 0; i<imageContainer.length; i++){
	var artist = encodeURIComponent(cardArtist.item(i).textContent.replace(/[!'()*]/g, escape));
	var album = encodeURIComponent(cardTitle.item(i).textContent.replace(/[!'()*]/g, escape));
	imageContainer.item(i).setAttribute('href', '/album/' + artist + '+' + album);
}

if(!albumList.innerHTML.trim()){
	albumList.innerHTML = '<div id="noMusic"><h2>Where\'s all your music?</h2><p>Use the search bar to find your favorite albums and add them to your collection.</p></div>';
	sortAndDelete.style.display='none';
} else {


//sort artists
for(var i = 0; i<artistList.length; i++){
	sortArtists.push([artistList.item(i).textContent]);
	sortArtists[i].push(title.item(i).textContent);
	sortArtists[i].push(image.item(i).src);
	sortArtists[i].push(added.item(i).textContent);
	sortArtists[i].push(trash.item(i).action.slice(33, -15))
}

////sort
///image
for(var i=0; i < image.length; i++){
	images.push(image.item(i).src)
}

///detect long names
detect();
function detect(){
///artist
	for(var i=0; i < artistList.length; i++){
		artists.push(artistList.item(i).textContent)
		if(artistList.item(i).textContent.length > 28){
			artistList.item(i).textContent = artistList.item(i).textContent.slice(0, 25) + '...'
		}
	}
	///album
	for(var i=0; i < title.length; i++){
		albums.push(title.item(i).textContent)
		if(title.item(i).textContent.length > 28){
			title.item(i).textContent = title.item(i).textContent.slice(0, 25) + '...'
		}
	}
}
///date added
for(var i=0; i < added.length; i++){
	addedOn.push(added.item(i).textContent);
}



///sort added
for(var i = 0; i<artists.length; i++){
	sortAdded.push([added.item(i).textContent]);
	sortAdded[i].push(artistList.item(i).textContent);
	sortAdded[i].push(title.item(i).textContent);
	sortAdded[i].push(image.item(i).src);
}
///sort lowercase

for(var i = 0; i<artists.length; i++){
	sortLowerCase.push([artistList.item(i).textContent.toLowerCase()]);
	sortLowerCase[i].push(title.item(i).textContent.toLowerCase());
	sortLowerCase[i].push(image.item(i).src);
}




var resultsReady = []
var results = []
var revert = albumList.innerHTML;
search.addEventListener('keyup', (e) => {
	if(e.which !== 13){
	if(search.value.length === 0){
		albumList.innerHTML = revert;
	} else if (results.length === 0){
		albumList.innerHTML = '';
	}
	results = []
	displayResults()
	function displayResults(){
		if(search.value){
			for(var i=0; i<sortArtists.length;i++){
				sortArtists[i].forEach((j) => {
					if(j.toLowerCase().indexOf(search.value.toLowerCase()) >= 0){
						if(results.indexOf(sortArtists[i]) < 0){
							results.push(sortArtists[i])
						}
					}
				})
			}
			if(results.length !== 0){
				albumList.innerHTML = ''
				for(var i=0;i<results.length;i++){
					var trashId = results[i][4];
					
					albumList.innerHTML += "<div id='card' class='card'><a class='image' id='imageContainer' href=\'/album/" + encodeURIComponent(results[i][0].replace(/[!'()*]/g, escape)) + "+" + encodeURIComponent(results[i][1].replace(/[!'()*]/g, escape)) + "\'><img id='image' class='img' title='" + results[i][1] + "' src='" + results[i][2] + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + results[i][0] + "</h4><h7 id='title'>" + results[i][1] + "</h7></div><form id='trash' action='/collection/" + trashId + "?_method=DELETE' method='POST'><button id='invisButton' class='ui mini red button'>Delete</button></form></div>"		 
				};
				detect();
			}
			
		}
	}
	}
})





edit.addEventListener('click', (e) => {
	trash = document.querySelectorAll('#trash')
	
	if(trash[0].style.display === ''){
		for(var i=0;i<trash.length;i++){
		trash[i].style.display = 'block';
		};
	} else {
		for(var i=0;i<trash.length;i++){
		trash[i].style.display = '';
		};
	}
})

var sortedByArtist = '';
for(var i=0;i<artists.length;i++){
			var sorted = sortArtists.sort()
			sortedByArtist += "<div id='card' class='card'><a class='image' id='imageContainer' href=\'/album/" + encodeURIComponent(sorted[i][0].replace(/[!'()*]/g, escape)) + "+" + encodeURIComponent(sorted[i][1].replace(/[!'()*]/g, escape)) + "\'><img id='image' class='img' title='" + sorted[i][1] + "' src='" + sorted[i][2] + "'></a><div id='cardInfo' class='ui center aligned container'><h4 id='cardArtist'>" + sorted[i][0] + "</h4><h7 id='title'>" + sorted[i][1] + "</h7></div><form id='trash' action='/collection/" + sorted[i][4] + "?_method=DELETE' method='POST'><button id='invisButton' class='ui mini red button'>Delete</button></form></div>"					 
		};

artistSort.addEventListener('click', (e) => {
	if(artistSort.textContent === 'Added'){
		artistSort.textContent = 'Artists';
		albumList.innerHTML='';
		albumList.innerHTML=sortedByArtist;
	} else {
		artistSort.textContent = 'Added';
		albumList.innerHTML = revert;
	}
});

/*///link generator
for(var i=0; i < links.length; i++){
	var arr = links[i].getAttribute('href').slice(8).split('+');
	var artist = arr[0].replace(/[!'()*]/g, escape);
	var album = arr[1].replace(/[!'()*]/g, escape);
	var encodedLink = '/album/' + encodeURIComponent(artist) + '+' + encodeURIComponent(album);
	links[i].setAttribute('href', encodedLink)
}*/

};
