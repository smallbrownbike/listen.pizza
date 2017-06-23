// randomImage = document.getElementById('randomImage'),
var message = document.getElementById('message'),
randomArtistName = document.getElementById('randomArtist'),
listened = document.getElementById('listened');
// randomButtonContainer = document.getElementById('randomButtonContainer'),
// similarCollection = document.getElementById('similarCollection'),

if(artists){
var randomNumber = Math.floor(Math.random() * (artists.length - 1)) + 1
var randomArtist = artists[randomNumber];


function similarListener(){
  GenerateRandom(JSON.parse(this.responseText))
}
var params = {
  similarRandom: encodeURIComponent(randomArtist)
}
var xhr = new XMLHttpRequest();
xhr.onload = similarListener;
xhr.open('POST', '/api');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(params));

function GenerateRandom(data){
  
  var similar = data.similarartists.artist;
  (function checkRandom() {
    var randomSimilarNumber = Math.floor(Math.random() * (similar.length - 1)) + 1;
    var similarArtist = similar[randomSimilarNumber];
    if(artists.indexOf(similarArtist.name) < 0){
      // randomImage.innerHTML = '<img src="' + similarArtist.image[3]['#text'] + '">';
      listened.textContent = similarArtist.name;
      listened.setAttribute('href', '/artist/search/' + encodeURIComponent(similarArtist.name.replace(/[!'()*]/g, escape)));
      // randomArtistName.textContent = similarArtist.name;
      // randomArtistName.setAttribute('href', '/artist/search/' + encodeURIComponent(similarArtist.name.replace(/[!'()*]/g, escape)));
      // getTopTracks(similarArtist.name)
    } else {
      checkRandom()
    }
  }) ();
  message.style.display = 'block';

  /*function getTopTracks(similarArtist){
    function topTracksListener(){
    youtube(JSON.parse(this.responseText))
    }
    var params = {
      topTracks: similarArtist
    }
    var xhr = new XMLHttpRequest();
    xhr.onload = topTracksListener;
    xhr.open('POST', '/api');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(params));
  }


  function youtube(data){
    arr = data.toptracks.track;
    arr.forEach((i) => {
      function youtubeListener(){
        generateButton(JSON.parse(this.responseText))
      }
      var params = {
        youtube: i.artist.name + ' ' + i.name
      }
      var xhr = new XMLHttpRequest();
      xhr.onload = youtubeListener;
      xhr.open('POST', '/api');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(params));
    })
    id = []
    function generateButton(data){
      id.push(data.items[0].id.videoId)
      if(id.length === 10){
        var cleanId = []
        for(var i=0; i<id.length;i++){
          if(id[i] !== undefined){
            cleanId.push(id[i])
          }
        }
        similarCollection.style.display = 'block';
        randomButtonContainer.innerHTML = "<a id='randomButton' class='ui small basic blue button' target='_blank' href='https://www.youtube.com/watch_videos?video_ids=" + cleanId.join(',') + "'>Listen</a>"
        } 
        
    }
  }*/
}

  
  
  
  

/////
  
  
  
  
}
/*var closeIcon = document.querySelectorAll('#closeIcon')
closeIcon.forEach((i) => {
  i.addEventListener('click', (e) => {
    similarCollection.style.display = 'none';
    message.style.display ='none';
  })
})*/

var closeIcon = document.getElementById('closeIcon');
closeIcon.addEventListener('click', (e) => {
  // similarCollection.style.display = 'none';
  message.style.display ='none';
})

