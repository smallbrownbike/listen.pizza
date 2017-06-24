var searchBar = document.getElementById('search'),
albumList = document.getElementById('albumList'),
searchSegment = document.getElementById('searchSegment');

////////

searchBar.focus();

searchBar.addEventListener('keypress', (e) => {
	if(e.which === 13){
		window.location.href = '/artist/search/' + encodeURIComponent(searchBar.value).replace(/[!'()*]/g, escape);
	}
})

searchSegment.addEventListener('click', (e) => {
	searchBar.focus();
})