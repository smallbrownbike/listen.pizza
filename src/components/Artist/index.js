import React from 'react';
import {Link} from 'react-router-dom';
import Albums from '../Albums'
import './style.css';

////Bio
class Bio extends React.Component {
render() {
  return (
    <div className='mt mgone ui left aligned container'>
      <strong><span className='expand'>Bio </span></strong>
      <div className='mgone ui segment center aligned container'>
        <div className='ui circular medium image'>
          <img alt={this.props.name} src={this.props.image ? this.props.image : require('../../images/logo.png')}></img>
        </div>
        <div className='ui text container'>
          <h1 className='mt'>{this.props.name}</h1>
          <div className='ui fitted divider'></div>
        </div>
        <div className='mt ui text container' dangerouslySetInnerHTML={{__html: this.props.bio}}></div>
        <div className='mt ui center aligned container'>
          {this.props.tags.map((i) => {
            return <Link to={'/tag/' + encodeURIComponent(i.name)} className="ui tag label" key={i.name}>{i.name}</Link>
          })}
        </div>
      </div>
    </div>
    )
  }
}




////Songs

class Songs extends React.Component {
  render() {
    return (
      <div className='mt mgone ui left aligned container'>
        <strong><span>Songs</span></strong>
        <span>
          <a className='right' target='_blank' href={'https://www.youtube.com/watch_videos?video_ids=' + this.props.playlist}>Play All</a>
        </span>
        <table className="mgone ui fixed single line celled table">
          <tbody>
            {this.props.tracks.map((i, index) => {
              if(index < 5){
                return (
                  <tr key={index}>
                    <td className='dn fw'>{this.props.tracks[index].name}<a target='_blank' href={this.props.link[index] !== 'notfound' ? 'https://www.youtube.com/watch?v=' + this.props.link[index] : ''}><button className={this.props.link[index] !== 'notfound' ? 'ui right floated small basic blue button' : "ui right floated small basic grey disabled button"}>Listen</button></a></td>
                    <td className='dn fw'>{this.props.tracks[index+5].name}<a target='_blank' href={this.props.link[index+5] !== 'notfound' ? 'https://www.youtube.com/watch?v=' + this.props.link[index+5] : ''}><button className={this.props.link[index+5] !== 'notfound' ? 'ui right floated small basic blue button' : "ui right floated small basic grey disabled button"}>Listen</button></a></td>
                  </tr>
                )
              } else {
                return null
              }
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

////Similar
class Similar extends React.Component{
  render(){
    return (
      <div className = 'mt mgone ui left aligned container'>
        <strong><span>Similar</span></strong>
        <div className='mgone ui segment container'>
        <div className='pmgone ui grid container'>
        <div className='pmgone ui five column grid'>
          {this.props.similar.map((i) => 
            <div key={i.name}className='pgone similar column'>
              <div className='bgone mgone boxgone ui card'>
                <Link to={'/artist/' + encodeURIComponent(i.name)} className='bgone similarBandImage inlineblock image'>
                  <img className='bgone' alt={i.name} className='bgone' src={i.image[3]['#text'] ? i.image[3]['#text'] : require('../../images/logo.png')}></img>
                  <div className='similarBandName ui text container'>
                    {i.name}
                  </div>
                </Link>
              </div>
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    )
  }
}

////Main
var artistCache = {}
export default class Artist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {loading: true}
    
    this.generateContent = this.generateContent.bind(this)
  }

  generateContent(location){
    var artist = decodeURIComponent(location);
    window.scrollTo(0, 0)
    if(artistCache[artist]){
      this.setState({loading: false})
      return
    } else {
      var id = {};
      var orderedId = [];

      function topAlbums(albums){
        var arr=[]
        for(var i=0;i<4;i++){
          arr.push(albums[i])
        }
        return arr;
      }

      function extraAlbums(albums){
        var arr=[]
        for(var i=4;i<albums.length-4;i++){
          arr.push(albums[i])
        }
        return arr;
      }
      
      this.setState({loading: true})
      var bioParams = {similar: artist};
      fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(bioParams)})
      .then(response => response.json()).then(json => {this.setState({similar: json.artist.similar.artist, name: json.artist.name, image: json.artist.image[3]['#text'], bio: json.artist.bio.summary, tags: json.artist.tags.tag})})
      .then(() => {
        var topAlbumParams = {topAlbums: this.state.name}
        fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(topAlbumParams)})
        .then(response => response.json()).then(json => this.setState({topAlbums: topAlbums(json.topalbums.album), extraAlbums: extraAlbums(json.topalbums.album)}))

        var trackParams = {topTracks: this.state.name};
        fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(trackParams)})
        .then(response => response.json()).then(json => {this.setState({tracks: json.toptracks.track});}).then(() => {
          this.state.tracks.forEach((i) => {
            var youtubeParams = {youtube: {artist: this.state.name, song: i.name}};
            fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(youtubeParams)})
            .then(response => response.json())
            .then(json => {
              id[i.name] = json; 
            })
            .then(() => {
              if(Object.keys(id).length === this.state.tracks.length){
              this.state.tracks.forEach((i) => {
                if(i.name !== undefined){
                  orderedId.push(id[i.name])
                } else {
                  orderedId.push('notfound')
                }
              })
              this.setState({link: orderedId, playlist: orderedId.filter((i) => {return i !== 'notfound'}).join(','), loading: false})
              artistCache[artist] = {
                name: this.state.name,
                image: this.state.image,
                bio: this.state.bio,
                tags: this.state.tags,
                topAlbums: this.state.topAlbums,
                extraAlbums: this.state.extraAlbums,
                tracks: this.state.tracks,
                link: this.state.link,
                playlist: this.state.playlist,
                similar: this.state.similar
              }
            }})
          })
        })
      })
    }
  }

  componentWillReceiveProps(nextProps){
    this.generateContent(nextProps.location.pathname.slice(8));
  }

  componentDidMount() {
    this.generateContent(window.location.pathname.slice(8));
  }
  
  render() {
    var artist = decodeURIComponent(window.location.pathname.slice(8));
    if(this.state.loading !== true){
      if(artistCache[artist]){
        return (
          <div className='p1 pb pt ui container'>
            <title>{artistCache[artist].name}</title>
            <Bio name={artistCache[artist].name} image={artistCache[artist].image} bio={artistCache[artist].bio} tags={artistCache[artist].tags}/>
            <Albums artistLinks={false} authed={this.props.authed} topAlbums={artistCache[artist].topAlbums} extraAlbums={artistCache[artist].extraAlbums}/>
            <Songs artist={artistCache[artist].name} tracks={artistCache[artist].tracks} link={artistCache[artist].link} playlist={artistCache[artist].playlist}/>
            <Similar similar={artistCache[artist].similar}/>
          </div>
        )
      } else {
        return(
          <div className='p1 pb pt ui container'>
            <title>{this.state.name}</title>
            <Bio name={this.state.name} image={this.state.image} bio={this.state.bio} tags={this.state.tags}/>
            <Albums artistLinks={false} authed={this.props.authed} topAlbums={this.state.topAlbums} extraAlbums={this.state.extraAlbums}/>
            <Songs artist={this.state.name} tracks={this.state.tracks} link={this.state.link} playlist={this.state.playlist}/>
            <Similar similar={this.state.similar}/>
          </div>
        )
      }
    } else {
      return <div className="ui active loader"></div>
    }
  }
}