

const search = document.getElementById('search'),
albumList = document.getElementById('albumList'),
searchSegment = document.getElementById('searchSegment');

search.focus();

search.addEventListener('keyup', (e) => {
	if(e.which === 13){
		window.location.href = '/artist/search/' + search.value;
	}
})

searchSegment.addEventListener('click', (e) => {
	search.focus();
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
