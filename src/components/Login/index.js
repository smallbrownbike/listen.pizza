import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'semantic-ui-react';
import Forgot from '../Forgot';
import './style.css';



////Error
class Error extends React.Component{
  render(){
    if(this.props.error){
      return(
        <div className="ui error message">
          <div className="header">The username or password you entered is invalid.</div>
          <p>Please try again.</p>
        </div>
      )
    } else {
      return null
    }
  }
}

////Main
export default class Login extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      email: {
        value: ''
      },
      password: {
        value: ''
      },
      error: false,
      hidden: false
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };
  handleSubmit(e){
    e.preventDefault();
    fetch('/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: this.state.email.value, password: this.state.password.value})})
    .then(response => {if(!response.ok){this.setState({error: true})};return response.json()}).then(json => {localStorage.setItem('login', JSON.stringify({name: json.name, username: json.username, token: json.token, time: Date.now()}));window.location.pathname = '/collection'})
  }
  handleEmailChange(e){
    this.setState({error: false, hidden: true, email: {value: e.target.value}})
  }
  handlePasswordChange(e){
    this.setState({error: false, hidden: true, password: {value: e.target.value}})
  }
  render(){
    return (
      <div className='lm ui container'>
        <div className='ui segment'>
          <title>Login</title>
          <div className="ui info icon message">
            <i className="announcement icon"></i>
            <div className="content">
              <div className="header">
                Don't feel like logging in?
              </div>
              <p>You can use the search bar to find your favorite music at any time.</p>
            </div>
          </div>
          <h1>Login</h1>
          <div className="ui divider"></div>
          <form onSubmit={this.handleSubmit} className="ui form">
            <Error error={this.state.error}/>
            <div className="field">
              <label>Email Address</label>
              <input type="email" value={this.state.email.value} onChange={this.handleEmailChange} name="email" placeholder="Email Address"></input>
            </div>
            <div className="field">
              <label>
                Password
                <div className='fr'>
                  <Modal
                  closeOnDocumentClick={true}
                  closeIcon={true}
                  trigger={<a className='pointer'>Forgot?</a>}
                  size={'small'}
                  closeOnDimmerClick={true}
                  >
                  <Forgot modal={true}/>
                  </Modal>
                </div>
              </label>
              
              <input type="password" value={this.state.password.value} onChange={this.handlePasswordChange} placeholder="Password"></input>
            </div>
            <button className="ui black button" type="submit">Login</button>
          </form>
          <div className='mt pointer'>
            <strong><Link to='/register'>Need an account?</Link></strong>
          </div>
        </div>
      </div>
    )
  }
}