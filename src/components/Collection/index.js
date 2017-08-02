import React from 'react';
import './style.css'
import { Link } from 'react-router-dom';

////Library
class Library extends React.Component{
  constructor(props){
    super(props)
    this.state = {deletingAnimation: '', delete: {loading: false, id: []}, trash: [], empty: false, albums: this.props.albums, artists: this.props.artists, type: 'albums', edit: false}
    this.handleClick = this.handleClick.bind(this)
    this.handleEdit = this.handleEdit.bind(this)    
    this.handleDelete = this.handleDelete.bind(this)

    this.delete = function deleteAlbum(id, artist){
      var artistCheck = []
      var sortedArtists = [];
      var artists = [];
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/delete', {method: 'POST', headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({id: id})})
      .then(response => response.json())
      .then(json => {
        this.setState({albums: json.albums})
        json.albums.forEach((i) => {
          if(artistCheck.indexOf(i.artist) < 0){
            artistCheck.push(i.artist)
            sortedArtists.push([i.artist, i.artistImage, [i]])
          }
        })
        sortedArtists = sortedArtists.sort()
        sortedArtists.forEach((i) => {
          if(!artists[i.name]){
            artists.push({
              name: i[0],
              image: i[1],
            })
          }
        })
        if(json.albums.length === 0){
          this.setState({empty: true})
        } else if(this.state.type === 'artistSpecific' && artistCheck.indexOf(artist) < 0){
          this.setState({type: 'artists', edit: false})
        } else if(this.state.type === 'artistSpecific'){
          var albums = []
          json.albums.forEach((i) => {
            if(i.artist === artist){
              albums.push(i)
            }
          })
          this.setState({artistAlbums: albums})
        }
        this.setState({artists: artists, delete: {loading: false, id: []}, edit: false})
      })
    }
  }
  handleDelete(id, artist){
    if(!this.state.delete.loading){
      if(this.state.trash.indexOf(id) < 0){
      this.state.trash.push(id);
      this.setState({trash: this.state.trash})
      } else {
        var index = this.state.trash.indexOf(id);
        this.state.trash.splice(index, 1)
        this.setState({trash: this.state.trash})
      }
    }
  }
  handleEdit(){
    if(this.state.edit){
      if(this.state.trash.length > 0){
        var deletingAnimation = setInterval(() => {
          if(!this.state.delete.loading){
            clearInterval(deletingAnimation)
          }
          if(this.state.deletingAnimation.length < 3){
            this.setState({deletingAnimation: this.state.deletingAnimation += '.'})
          }else{
            this.setState({deletingAnimation: ''})
          }
        }, 500)
        this.setState({delete: {loading: true, id: this.state.trash}})
        this.delete(this.state.trash, this.state.artist)
        this.setState({trash: []})
        
      } else {
        this.setState({edit: false})
      }
    } else {
      this.setState({edit: true})
    }
  }
  handleClick(artist, image){
    var albums = []
    this.state.albums.forEach((i) => {
      if(i.artist === artist){
        albums.push(i)
      }
    })
    this.setState({type: 'artistSpecific', image: image, artist: artist, artistAlbums: albums})
  }

  render(){
      if(this.state.empty){
        return(
          <div className="ui container">
            <title>Collection</title>
            <div className='mt mgone ui segment'>
              <div className='m2 ui center aligned container'>
                <h1>Woah! Where'd all your music go?</h1>
                <p>Use the search bar to find your favorite music and add it to your collection.</p>
              </div>
            </div>
          </div>
        )
      }
      if(this.state.type === 'albums'){
      return(
        <div className='mt mgone ui container'>
          <div className='ui container'>
            <div className="ui breadcrumb">
              <div onClick={() => {this.setState({type: 'albums'})}} className={this.state.type === 'albums' ? 'active section pointer' : 'section blue pointer'}>Albums</div>
              <div className="divider"> / </div>
              <div onClick={() => {this.setState({type: 'artists'})}} className={this.state.type === 'artists' ? 'active section pointer' : 'section blue pointer'}>Artists</div>
            </div>
            <div onClick={this.handleEdit} className='fr'>
              <span>{this.state.delete.loading ? <i className="trash red outline icon"></i> : this.state.edit ? this.state.trash.length > 0 ? <i className="trash red outline icon"></i> : <i className="trash outline icon"></i> : ''}</span><span className='red pointer'>{this.state.delete.loading ? 'Deleting' + this.state.deletingAnimation : this.state.edit ? this.state.trash.length > 0 ? 'Delete' : 'Done' : 'Edit'}</span>
            </div>
          </div>
          <div className="mtgone ui segment">
            <div className='ui four cards'>
              {this.state.albums.map((i) => {
                return (
                  <div key={i.title} className='card'>
                    <Link className='image' to={'/album/' + encodeURIComponent(i.artist) + '+' + encodeURIComponent(i.title)}>
                      <img alt={i.title} title={i.title} src={i.image ? i.image : require('../../images/logo.png')}></img>
                    </Link>
                    <div className='mtba p ui center aligned container'>
                      <Link to={'/artist/' + encodeURIComponent(i.artist)}><h4>{i.artist}</h4></Link>
                      <h7 >{i.title}</h7>
                    </div>        
                    <div onClick={() => {this.handleDelete(i['_id'])}} className={this.state.edit ? '' : 'hidden'}>
                      <button className={this.state.delete.loading && this.state.delete.id.indexOf(i['_id']) < 0 ? 'w100 tbgone ui mini basic disabled button' : this.state.delete.id.indexOf(i['_id']) >= 0 ? 'w100 tbgone ui mini basic disabled loading button' : this.state.trash.indexOf(i['_id']) >= 0 ? 'w100 tbgone ui mini red button' : 'w100 tbgone ui mini basic red button'}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }
    if(this.state.type === 'artists') {
      return(
        <div className='mt mgone ui container'>
          <div className='ui container'>
            <div className="ui breadcrumb">
              <div onClick={() => {this.setState({type: 'albums'})}} className={this.state.type === 'albums' ? 'active section pointer' : 'section blue pointer'}>Albums</div>
              <div className="divider"> / </div>
              <div onClick={() => {this.setState({type: 'artists'})}} className={this.state.type === 'artists' ? 'active section pointer' : 'section blue pointer'}>Artists</div>
            </div>
            
          </div>
          <div className='mgone ui segment container'>
            <div className='ui five cards'>
                {this.state.artists.map((i) => 
                  <div key={i.name} onClick={() => {window.scrollTo(0, 0);this.handleClick(i.name, i.image)}} className='ui pointer card'>                      
                    <div className='image'>
                      <img alt={i.name} title={i.name} src={i.image ? i.image : require('../../images/logo.png')}></img>
                    </div>
                    <div className='mtba p ui center aligned container'>
                      <h4>{i.name}</h4>
                    </div>       
                  </div>
                )}
              
            </div>
          </div>
        </div>
      )
    } 
    if(this.state.type === 'artistSpecific') {
      return (
        <div className='mt mgone ui container'>
          <div className='ui container'>
            <div className="ui breadcrumb">
              <div onClick={() => {this.setState({type: 'albums'})}} className={this.state.type === 'albums' ? 'active section pointer' : 'section blue pointer'}>Albums</div>
              <div className="divider"> / </div>
              <div onClick={() => {this.setState({type: 'artists'})}} className={this.state.type === 'artists' ? 'active section pointer' : 'section blue pointer'}>Artists</div>
              <div className="divider"> / </div>
              <div className='active section pointer'>{this.state.artist}</div>
            </div>
            <div onClick={() => {this.handleEdit(this.state.artist)}} className='fr'>
              <span>{this.state.delete.loading ? <i className="trash red outline icon"></i> : this.state.edit ? this.state.trash.length > 0 ? <i className="trash red outline icon"></i> : <i className="trash outline icon"></i> : ''}</span><span className='red pointer'>{this.state.delete.loading ? 'Deleting' + this.state.deletingAnimation : this.state.edit ? this.state.trash.length > 0 ? 'Delete' : 'Done' : 'Edit'}</span>
            </div>
          </div>
          <div className="mtgone ui segment">
            <div className='ui four cards'>
              {this.state.artistAlbums.map((i) => {
                return (
                  <div key={i.title} className='card'>
                    <Link className='image' to={'/album/' + encodeURIComponent(i.artist) + '+' + encodeURIComponent(i.title)}>
                      <img alt={i.title} title={i.title} src={i.image ? i.image : require('../../images/logo.png')}></img>
                    </Link>
                    <div className='mtba p ui center aligned container'>
                      <Link to={'/artist/' + encodeURIComponent(i.artist)}><h4>{i.artist}</h4></Link>
                      <h7 >{i.title}</h7>
                    </div>        
                    <div onClick={() => {this.handleDelete(i['_id'])}} className={this.state.edit ? '' : 'hidden'}>
                      <button className={this.state.delete.loading && this.state.delete.id.indexOf(i['_id']) < 0 ? 'w100 tbgone ui mini basic disabled button' : this.state.delete.id.indexOf(i['_id']) >= 0 ? 'w100 tbgone ui mini basic disabled loading button' : this.state.trash.indexOf(i['_id']) >= 0 ? 'w100 tbgone ui mini red button' : 'w100 tbgone ui mini basic red button'}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }
  }
}


////Main
export default class Collection extends React.Component{
  constructor(props){
    super(props)
    this.state = {loading: true}
  }

  componentDidMount(){
    var artistCheck = []
    var sortedArtists = [];
    var artists = [];
    var token = JSON.parse(localStorage.getItem('login')).token;
    fetch('/api/collection', {method: 'POST', headers: {Authorization: 'Bearer ' + token}})
    .then(response => response.json())
    .then(json => {
      json.albums.forEach((i) => {
        if(artistCheck.indexOf(i.artist) < 0){
          artistCheck.push(i.artist)
          sortedArtists.push([i.artist, i.artistImage, [i]])
        }
			})
      sortedArtists = sortedArtists.sort()
      sortedArtists.forEach((i) => {
        if(!artists[i.name]){
          artists.push({
            name: i[0],
            image: i[1],
          })
        }
      })
      this.setState({artists: artists, albums: json.albums, loading: false})
    })
  }

  render(){
    if(this.state.loading === false){
      window.scrollTo(0, 0)
      if(Object.keys(this.state.albums).length <= 0){
        return (
          <div className="p1 pb pt ui container">
            <title>Collection</title>
            <div className='mt mgone ui segment'>
              <div className='m2 ui center aligned container'>
                <h1>Hey, {JSON.parse(localStorage.getItem('login')).name[0].toUpperCase() + JSON.parse(localStorage.getItem('login')).name.slice(1)}! Where's all your music?</h1>
                <p>Use the search bar to find your favorite music and add it to your collection.</p>
              </div>
            </div>
          </div>
        )
      }
      return(
        <div className="p1 pb pt ui container">
          <title>Collection</title>
          <Library delete={this.state.delete} albums={this.state.albums} type={this.state.type} artists={this.state.artists}/>
        </div>
      )
    } 
    return <div className="ui active loader"></div>
  }
}