import React from 'react'
import Albums from '../Albums'
import { Link } from 'react-router-dom'
import './style.css'

////Info
class Info extends React.Component {
  render(){

    return(
      <div className='mt ui left aligned container'>
        <strong><span>Info </span></strong>
        <div className='mgone ui segment center aligned container'>
          <div className='ui text container'>
            <h1 className='lt mt'>#{this.props.name}</h1>
            <div className='ui fitted divider'></div>
          </div>
          <div className='mt ui text container' dangerouslySetInnerHTML={{__html: this.props.summary}}></div>
        </div>
      </div>
    )
  }
}

////Artists
class Artists extends React.Component{
  constructor(props) {
    super(props)
    this.state = {hidden: true, expand: '+'}
  }
  render(){
    return(
      <div className = 'mt ui left aligned container'>
        <strong><span className='pointer' onClick={() => {this.state.hidden === true ? this.setState({hidden: false, expand: '-'}) : this.setState({hidden: true, expand: '+'})}}>Artists <a>{this.state.expand}</a></span></strong>
        <div className='mgone ui segment container'>
          <TopArtists artists={this.props.topArtists}/>
          <ExtraArtists artists={this.props.extraArtists} hidden={this.state.hidden}/>
        </div>
      </div>
    )
  }
}

////Top Artists
class TopArtists extends React.Component{
  render(){
    return(
      <div className='pmgone ui grid container'>
      <div className='pmgone ui four column grid'>
        {this.props.artists.map((i) => 
          <div key={i.name}className='pgone column'>
            <div className='bgone mgone boxgone ui card'>
              <Link to={'/artist/' + encodeURIComponent(i.name)} className='bgone similarBandImage inlineblock image'>
                <img className='bgone' alt={i.name} src={i.image[3]['#text'] ? i.image[3]['#text'] : require('../../images/logo.png')}></img>
                <div className='similarBandName ui text container'>
                  {i.name}
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>
    )
  }
}

////Extra Artists
class ExtraArtists extends React.Component{
  render(){
    if(!this.props.hidden){
      return (
      <div className='pmgone ui grid container'>
      <div className='pmgone ui four column grid'>
          {this.props.artists.map((i) => 
            <div key={i.name}className='pgone column'>
              <div className='bgone mgone boxgone ui card'>
                <Link to={'/artist/' + encodeURIComponent(i.name)} className='bgone similarBandImage inlineblock image'>
                  <img className='bgone' alt={i.name} src={i.image[3]['#text'] ? i.image[3]['#text'] : require('../../images/logo.png')}></img>
                  <div className='similarBandName ui text container'>
                    {i.name}
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
        </div>
      )
    } else {
      return null
    }
  }
}

////Main
export default class Tag extends React.Component{
  constructor(props){
    super(props)
    this.state = {loading: true}
  }

  componentDidMount(){
    function top(data){
      var arr=[]
      for(var i=0;i<8;i++){
        arr.push(data[i])
      }
      return arr;
    }
    function extra(data){
      var arr=[]
      for(var i=8;i<data.length-8;i++){
        arr.push(data[i])
      }
      return arr;
    }

    var tag = window.location.pathname.slice(5)
    var tagInfoParams = {tagInfo: tag}
    var tagArtistParams = {tagArtist: tag}
    var tagAlbumParams = {tagAlbum: tag}
    fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(tagInfoParams)})
    .then(response => response.json())
    .then(json => {
      this.setState({name: json.tag.name, summary: json.tag.wiki.summary});
      fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(tagArtistParams)})
      .then(response => response.json())
      .then(json => {
        this.setState({topArtists: top(json.topartists.artist), extraArtists: extra(json.topartists.artist)});
        fetch('/api/external', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(tagAlbumParams)})
        .then(response => response.json())
        .then(json => {this.setState({topAlbums: top(json.albums.album), extraAlbums: extra(json.albums.album), loading: false})})
      })
    })
 

  }
  render(){
    if(!this.state.loading){
      return(
      <div className='p1 pb pt ui container'>
        <title>{this.state.name}</title>
        <Info name={this.state.name} summary={this.state.summary} />
        <Artists topArtists={this.state.topArtists} extraArtists={this.state.extraArtists}/>
        <Albums authed={this.props.authed} artistLinks={true} topAlbums={this.state.topAlbums} extraAlbums={this.state.extraAlbums}/>
      </div>
      )
    } else {
      return <div className="ui active loader"></div>
    }
  }
}