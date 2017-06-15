

var searchBar = document.getElementById('search'),
albumList = document.getElementById('albumList'),
searchSegment = document.getElementById('searchSegment');

searchBar.focus();

searchBar.addEventListener('keypress', (e) => {
	if(e.which === 13){
		window.location.href = '/artist/search/' + searchBar.value;
	}
})

searchSegment.addEventListener('click', (e) => {
	searchBar.focus();
})

/*
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
	albumList.setAttribute('class', 'ui two cards')
} else {
	albumList.setAttribute('class', 'ui four cards')
}
*/

/*if(mq.matches){
  albumList.setAttribute('class', 'ui four cards')
} else {
	albumList.setAttribute('class', 'ui two cards')
}	*/
