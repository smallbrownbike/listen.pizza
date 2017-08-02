import React from 'react'
import { Link } from 'react-router-dom'

////Albums
export default class Albums extends React.Component{
  constructor(props) {
    super(props)
    this.state = {hidden: true, expand: '+'}
  }
  render() {
    return (
      <div className='mt mgone ui container'>
        <strong><span className='pointer' onClick={() => {this.state.hidden === true ? this.setState({hidden: false, expand: '-'}) : this.setState({hidden: true, expand: '+'})}}>Albums <a>{this.state.expand}</a></span></strong>
        <div className='mgone ui container segment'>
          <TopCards artistLinks={this.props.artistLinks} authed={this.props.authed} collection={this.props.collection} albums={this.props.topAlbums}/>
          <ExtraCards artistLinks={this.props.artistLinks} authed={this.props.authed} collection={this.props.collection} hidden={this.state.hidden} albums={this.props.extraAlbums}/>
        </div>
      </div>
    )
  }
}

////In Collection
class InCollection extends React.Component{
  constructor(props){
    super(props)
    this.state = {collection: false}
  }
  componentDidMount(){
    if(this.props.authed){
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/album', {method: 'POST', headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({artist: this.props.artist, title: this.props.album})})
      .then((response) => response.json())
      .then(json => {
        if(json.InCollection === 'yes'){
          this.setState({collection: true})
        }
      })
    }
  }

  render(){
    if(this.state.collection){
      return(
        <div className="ui green right corner label">
          <i className="checkmark icon"></i>
        </div>
      )
    } else return null
  }
} 

////Artist Album
class ArtistAlbum extends React.Component{
  render(){
    if(this.props.artistLinks){
      return(
        <div className='mtba p ui center aligned container'>
          <h4 className='mb'><Link to={'/artist/' + encodeURIComponent(this.props.artist)}>{this.props.artist}</Link></h4>
          <h7 className='mb'>{this.props.album}</h7>
        </div>
      ) 
    } else {
      return(
        <div className='mtba p ui center aligned container'>
          <h4 className='mb'>{this.props.artist}</h4>
          <h7 className='mb'>{this.props.album}</h7>
        </div>
      )
    }
  }
}

////Top Cards
class TopCards extends React.Component{
  render(){
    return(
      <div className='ui four cards'>
        {this.props.albums.map((i, index) => {
          return(
            <div className='ui card' key={i.name}>
              <Link className='image' to={'/album/' + encodeURIComponent(i.artist.name).replace(/[!'()*]/g, escape) + '+' + encodeURIComponent(i.name).replace(/[!'()*]/g, escape)}>
                <InCollection authed={this.props.authed} artist={i.artist.name} album={i.name}/>
                <img alt={i.name} className='img' src={i.image[3]['#text'] ? i.image[3]['#text'] : require('../../images/logo.png')}></img>
              </Link>
              <ArtistAlbum artistLinks={this.props.artistLinks} artist={i.artist.name} album={i.name}/>
            </div>
          )
        })}
      </div>
    )
  }
}

////Extra Cards
class ExtraCards extends React.Component{
  render(){
    if(!this.props.hidden){
      return (
        <div className='ui four cards'>
          {this.props.albums.map((i, index) => {
            return(
              <div className='ui card' key={i.name}>
                <Link className='image' to={'/album/' + encodeURIComponent(i.artist.name).replace(/[!'()*]/g, escape) + '+' + encodeURIComponent(i.name).replace(/[!'()*]/g, escape)}>
                  <InCollection authed={this.props.authed} artist={i.artist.name} album={i.name}/>
                  <img alt={i.name} className='img' src={i.image[3]['#text'] ? i.image[3]['#text'] : require('../../images/logo.png')}></img>
                </Link>
                <ArtistAlbum artistLinks={this.props.artistLinks} artist={i.artist.name} album={i.name}/>
              </div>
            )
          })}
        </div>
      )
    } else {
      return null
    }
  }
}
