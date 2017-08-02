import React from 'react';
import {Link} from 'react-router-dom';
import './style.css';

///Info 
class Info extends React.Component{
  render(){
    return(
      <div className="ui segment">
        <div className='ui medium image'>
          <img alt={this.props.name} src={this.props.image ? this.props.image : require('../../images/logo.png')}></img>
        </div>
        <div className="m ui text container">
          <strong>
            <Link className='f' to={'/artist/' + encodeURIComponent(this.props.artist)}>{this.props.artist}</Link>
            <span className="f"> - {this.props.album}</span>
          </strong>
        </div>
        <p className="review" dangerouslySetInnerHTML={{__html: this.props.summary}}></p>
        <Tags tags={this.props.tags}/>
      </div>
    )
  }
}

////Error
class Error extends React.Component{
  render(){
    return(
      <div className="ui negative message">
        <div className="ui center aligned text container">Darn! We couldn't find the tracklist for <strong>{this.props.album}</strong>.</div>
      </div>
    )
  }
}

////Tags
class Tags extends React.Component{
  render(){
    if(this.props.tags){
      return(
        <div className="ui center aligned container">
          {this.props.tags.map((i) => {
            return <Link to={'/tag/' + encodeURIComponent(i.name)} className="ui tag label" key={i.name}>{i.name}</Link>
          })}
        </div>
      )
    } else {
      return null
    }
  }
}

////Add
class Add extends React.Component{
  constructor(props){
    super(props)

    this.state = {collection: false, loading: true}

    this.addAlbum = function addAlbum(params){
      var addParams = {
				added: Date.now(),
				title: params.title,
				artist: params.artist,
				image: params.image,
        artistImage: params.artistImage
			};
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/add', {method: 'POST', headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify(addParams)})
    }

    
    this.delete = function deleteAlbum(){
      var id= []
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/album', {method: 'POST', headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({artist: this.props.artist, title: this.props.album})})
      .then((response) => response.json())
      .then(json => {
        id.push(json.id);
        fetch('/api/delete', {method: 'POST', headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({id: id})})
        .then(() => {
          setTimeout(() => {this.setState({collection: false, loading: false})}, 500)
        })
      }) 
    }

  }

  componentDidMount(){
    if(this.props.authed){
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/album', {method: 'POST', headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({artist: this.props.artist, title: this.props.album})})
      .then((response) => response.json())
      .then(json => {
        if(json.InCollection === 'yes'){
          
          this.setState({collection: true, loading: false})
        } else {
          this.setState({loading: false})
        }
      })
    }else{
      this.setState({collection: true, loading: false})
    }
  }

  render(){
    if(!this.state.loading){
      if(!this.props.authed){
        return(
          <button className='w100 default mb15 ui basic grey button' data="" data-tooltip="Log in to add this album to your collection!" data-position="top center">Add</button>
        )
      }
      if(this.state.collection !== true){
        return(
          <button onClick={() => {this.setState({loading: true}); setTimeout(() => {this.setState({collection: true, loading: false})}, 500); this.addAlbum({title: this.props.album, artist: this.props.artist, image: this.props.image, artistImage: this.props.artistImage})}} className='w100 mb15 ui basic green button' data="" data-tooltip="Add this album to your collection!" data-position="top center">Add</button>
        )
      } else {
          return (
            <button onClick={() => {this.setState({loading: true}); this.delete()}} className='w100 mb15 ui basic red button'>Delete</button>
          )
      }
    } else {
        return <button className='w100 default mb15 ui basic grey loading button'>Loading...</button>
    }
  }
}

////Playlist
class Playlist extends React.Component{
  render(){
    return(
      <div className="ui center aligned container"> 
        <a className='w100 ui basic blue button' target='_blank' href={'https://www.youtube.com/watch_videos?video_ids=' + this.props.playlistLink}>Play All</a>
      </div>
    )
  }
}

////Songs
class Songs extends React.Component{
  render(){
    return(
      <table className="ui fixed single line celled table">
        <tbody>
          {this.props.tracks.map((i, index) => {
            return (
              <tr key={index}>
                <td className='fw'>{this.props.tracks[index].name}<a target='_blank' href={this.props.link[i.name] !== 'notfound' ? 'https://www.youtube.com/watch?v=' + this.props.link[i.name] : ''}><button className={this.props.link[i.name] !== 'notfound' ? 'ui right floated small basic blue button' : "ui right floated small basic grey disabled button"}>Listen</button></a></td>
              </tr>
            )
          })}
        </tbody> 
      </table>
    )
  }
}

////Main
export default class Album extends React.Component{
  constructor(props){
    super(props)
    this.state = {loading: true}
  }

  componentDidMount(){
    var id = {};
    var orderedId = [];
    window.scrollTo(0, 0)
    var artistParams = {similar: decodeURIComponent(window.location.pathname.slice(7).split('+')[0])}
    fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(artistParams)})
    .then(response => response.json())
    .then(json => {
      this.setState({artistImage: json.artist.image[3]['#text']})
    })

    var albumParams = {albumInfo: window.location.pathname.slice(7).split('+')}
    fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(albumParams)})
    .then(response => response.json())
    .then(json => {
      if(json.album.tracks.track <= 0){
        this.setState({error: true, image: json.album.image[3]['#text'], album: json.album.name, artist: json.album.artist, tags: json.album.tags.tag});if(json.album.wiki){this.setState({summary: json.album.wiki.summary})}
      }else{
        this.setState({image: json.album.image[3]['#text'], tracks: json.album.tracks.track, album: json.album.name, artist: json.album.artist, tags: json.album.tags.tag}); if(json.album.wiki){this.setState({summary: json.album.wiki.summary})}}
      })
    
      .then(() => {
      if(!this.state.error){
        this.state.tracks.forEach((i, index) => {
          var albumYoutubeParams = {
            youtube: {artist: this.state.artist, song: i.name}
          };
          fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(albumYoutubeParams)})
          .then(response => response.json())
          .then(json => {
            if(json !== 'notfound'){id[i.name] = json}else{id[i.name] = 'notfound'};
          })
          .then(() => {if(Object.keys(id).length === this.state.tracks.length){
            this.state.tracks.forEach((i) => {
              if(id[i.name] !== 'notfound'){
                orderedId.push(id[i.name]);
              }
            })
          }})
          .then(() => {
            this.setState({link: id, playlistLink: orderedId, playlist: orderedId.join(','), loading: false})
          })
        })         
      } else {
        this.setState({loading: false})
      }
    })
  }

  render(){
    if(this.state.loading === false){
      if(!this.state.error){
        return (
          <div className='pt ui segment'>
            <title>{this.state.artist + ' - ' + this.state.album}</title>
            <div className='bg' style={{backgroundImage: 'url("' + this.state.image + '")'}}></div>
            <div className="w600 ui center aligned container">
              <div className="ui segment">
                  <Info name={this.state.name} image={this.state.image} artist={this.state.artist} album={this.state.album} summary={this.state.summary} tags={this.state.tags}/>
                  <Add authed={this.props.authed} artistImage={this.state.artistImage} image={this.state.image} artist={this.state.artist} album={this.state.album}/>
                  <Playlist playlistLink={this.state.playlistLink}/>
                  <Songs tracks={this.state.tracks} link={this.state.link}/>
              </div>
            </div>
          </div>
        )
      } else {
        return (
          <div className='pt ui segment'>
            <title>{this.state.artist + ' - ' + this.state.album}</title>
            <div className='bg' style={{backgroundImage: 'url("' + this.state.image + '")'}}></div>
            <div className="w600 ui center aligned container">
              <div className="ui segment">
                  <Info name={this.state.name} image={this.state.image} artist={this.state.artist} album={this.state.album} summary={this.state.summary} tags={this.state.tags}/>
                  <Add artistImage={this.state.artistImage} image={this.state.image} artist={this.state.artist} album={this.state.album}/>
                  <Error album={this.state.album}/>
              </div>
            </div>
          </div>
        )
      }
    } else {
      return <div className="ui active loader"></div>
    }
  }
}