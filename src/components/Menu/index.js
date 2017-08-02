import React from 'react';
import {Link} from 'react-router-dom';
import { Dropdown, Modal } from 'semantic-ui-react'
import Invite from '../Invite'
import Account from '../Account'
import Searchbar from '../AutoSearch'
import './style.css';

export default class Menu extends React.Component {
  constructor(props){
    super(props)
    this.state = {loading: true}
    this.checkCollection = this.checkCollection.bind(this)
    this.removeToken = this.removeToken.bind(this)
  }

  removeToken(){
    fetch('/api/logout', {method: 'POST', headers: {'content-type': 'application/json', 'authorization': 'Bearer ' + JSON.parse(localStorage.login).token}, body: JSON.stringify({token: JSON.parse(localStorage.login).token})})
    localStorage.removeItem('login');
    window.location.pathname = '/';
  }

  checkCollection(){
    var token = JSON.parse(localStorage.getItem('login')).token;
    fetch('/api/collection', {method: 'GET', headers: {Authorization: 'Bearer ' + token}})
    .then(response => response.json())
    .then(json => {
      this.setState({invites: json.invites})
    })
  }

  componentDidMount(){
    if(this.props.authed){
      var artists = []
      var albums = []
      var checkArtists = []
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/collection', {method: 'GET', headers: {Authorization: 'Bearer ' + token}})
      .then(response => response.json())
      .then(json => {
        this.setState({invites: json.invites})
        json.albums.forEach((i) => {
          var artist = i.artist;
          var title = i.title;
          var image = i.image;
          var artistImage = i.artistImage;
          if(checkArtists.indexOf(artist) < 0){
            checkArtists.push(artist)
            artists.push({
              title: artist,
              image: artistImage,
            })
          }
          albums.push({
            title: title,
            description: artist,
            image: image,
          })
        })
      })
      .then(() => {
        if(artists.length >= 5){
          fetch('/api/random', {method: 'POST', headers: {Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('login')).token}})
          .then(response => response.json())
          .then(json => {
            this.setState({random: JSON.parse(json)})
          })
        }
      })
      .then(() => {this.setState({collection: {Artists: {results: artists}, Albums: {results: albums}}, loading: false})})
    }
  }
  
  render() {
    if(this.props.authed === true){
      return(
        <div className="ui top fixed secondary menu">
          <div className='ui container'>
            <a className='left item' href='/collection'>Home</a>
            <div className="ui input">
              <Searchbar random={this.state.random} collection={this.state.collection} authed={this.props.authed}/>
            </div>
              <Dropdown compact={true} className='right item' text='Menu'>
                <Dropdown.Menu>
                  <Modal
                  closeOnDocumentClick={true}
                  closeIcon={true}
                  trigger={<Dropdown.Item text='Account' />}
                  size={'small'}
                  closeOnDimmerClick={true}
                  >
                  <Account />
                  </Modal>
                  <Modal
                  closeOnDocumentClick={true}
                  closeIcon={true}
                  trigger={<Dropdown.Item text={'Invite a Friend (' + this.state.invites + ')'} />}
                  size={'small'}
                  closeOnDimmerClick={true}
                  onClose={this.checkCollection}
                  >
                  <Invite invites={this.state.invites}/>
                  </Modal>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={this.removeToken} text='Logout' />
                </Dropdown.Menu>
              </Dropdown>
          </div>
        </div>
      )
    } else {
      return (
        <div className="ui top fixed secondary menu">
          <div className='ui container'>
            <a className='left item'  href='/'>Home</a>
            <div className="ui input">
              <Searchbar authed={false} />
            </div>
            <Link className='right item' to='/login'>Login</Link>
          </div>
        </div>
      );
    }
  }
}
