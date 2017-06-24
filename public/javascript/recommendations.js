var message = document.getElementById('message'),
randomArtistName = document.getElementById('randomArtist'),
closeIcon = document.getElementById('closeIcon'),
listened = document.getElementById('listened');

////////

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
        listened.textContent = similarArtist.name;
        listened.setAttribute('href', '/artist/search/' + encodeURIComponent(similarArtist.name.replace(/[!'()*]/g, escape)));
      } else {
        checkRandom()
      }
    }) ();
    message.style.display = 'block';
  }
  closeIcon.addEventListener('click', (e) => {
    message.style.display ='none';
  })
}



