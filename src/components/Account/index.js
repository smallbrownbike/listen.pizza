import React from 'react';
import ReactDOM from 'react-dom'
import './style.css';

////Error
class Error extends React.Component{
  render(){
    if(this.props.error){
      return(
        <div className="ui error message">
          <div className="header">{this.props.errorMessage.message}</div>
          <p>{this.props.errorMessage.description}</p>
        </div>
      )
    } else {
      return null
    }
  }
}

////Success
class Success extends React.Component{
  render(){
    if(this.props.success){
      return(
        <div className="ui positive message">
          <div className="header">{this.props.successMessage.message}</div>
          <p>{this.props.successMessage.description}</p>
        </div>
      )
    } else {
      return null
    }
  }
}

////Main
export default class Account extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      email: {
        value: JSON.parse(localStorage.login).username
      },
      name: {
        value: JSON.parse(localStorage.login).name
      },
      password: {
        value: ''
      },
      newPassword: {
        value: ''
      },
      comments: {
        value: ''
      },
      delete: 'Delete',
      error: false,
      success: false,      
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleNewPasswordChange = this.handleNewPasswordChange.bind(this);
    this.handleEmailSubmit = this.handleEmailSubmit.bind(this);
    this.handleNameSubmit = this.handleNameSubmit.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.handleCommentsChange = this.handleCommentsChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }
  componentDidMount(){

  }
  handleEmailSubmit(e){
    e.preventDefault();
    if(!this.state.email.value){
      this.setState({errorMessage: {message: 'Missing some info...', description: 'Please enter your new email address.'}, error: true})
    } else if(this.state.email.value.length > 254) {
      this.setState({errorMessage: {message: 'Woah! That email is huge!', description: 'Can you please make it less than 255 characters?'}, error: true})
    } else {
      var updateParams = {
        username: this.state.email.value,
        token: JSON.parse(localStorage.login).token
      }
      fetch('/api/updateemail', {method: 'POST', headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.login).token, 'content-type': 'application/json'}, body: JSON.stringify(updateParams)})
      .then(response => response.json())
      .then(json => {
        if(json.error){
          if(json.error === 'Same'){
            this.setState({errorMessage: {message: 'Email must be new.', description: 'Your new email address must be different than your current one.'}, success: false, error: true})
          } else if(json.error === 'UserExists'){
            this.setState({errorMessage: {message: 'Email address taken.', description: 'Someone is already using that email address.'}, success: false, error: true})
          }
        } else {
          localStorage.setItem('login', JSON.stringify({name: json.name, username: json.username, token: json.token, time: Date.now()}));
          this.setState({successMessage: {message: 'Done!', description: 'Your email address has been updated.'}, error: false, success: true})
        }
      })
    }
  }
  handleNameSubmit(e){
    e.preventDefault();
    if(!this.state.name.value){
      this.setState({errorMessage: {message: 'Missing some info...', description: 'Please enter your new name.'}, error: true})
    } else if(this.state.name.value.length >= 35) {
      this.setState({errorMessage: {message: 'Woah! That name is huge!', description: 'Can you please make it less than 35 characters?'}, error: true})
    } else {
      var updateParams = {
        name: this.state.name.value,
        token: JSON.parse(localStorage.login).token
      }
      fetch('/api/updatename', {method: 'POST', headers: {'Authorization': 'Bearer ' + JSON.parse(localStorage.login).token, 'content-type': 'application/json'}, body: JSON.stringify(updateParams)})
      .then(response => response.json())
      .then(json => {
        if(json.error === 'Same'){
          this.setState({errorMessage: {message: 'Name must be new.', description: 'Your new name must be different than your current one.'}, success: false, error: true})
        } else {
          localStorage.setItem('login', JSON.stringify({name: json.name, username: json.username, token: json.token, time: Date.now()}));
          this.setState({successMessage: {message: 'Done!', description: 'Your name has been updated.'}, error: false, success: true})
        }
      })
    }
  }
  handlePasswordSubmit(e){
    var username = JSON.parse(localStorage.login).username
    var password = this.state.password.value
    var newPassword = this.state.newPassword.value
    e.preventDefault();
    if(!password || !newPassword){
      this.setState({errorMessage: {message: 'Missing some info...', description: 'Please fill out all fields.'}, error: true})
    } else {
      fetch('/api/checkcredentials', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: username, password: password})})
      .then(response => {
        if(!response.ok){
          this.setState({errorMessage: {message: 'Current password is invalid.', description: 'Please enter the correct password.'}, success: false, error: true})
        } else {
          fetch('/api/resetpassword', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JSON.parse(localStorage.login).token}, body: JSON.stringify({token: JSON.parse(localStorage.login).token, password: newPassword})})
          .then(response => response.json())
          .then(json => {
            if(json.success){
              fetch('/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: username, password: newPassword})})
              .then(response => {
                if(!response.ok){
                  this.setState({error: true})
                } else {
                  return response.json()
                }
              })
              .then(json => {localStorage.setItem('login', JSON.stringify({name: json.name, username: json.username, token: json.token, time: Date.now()}))})
              this.setState({password: {value: ''}, newPassword: {value: ''}, successMessage: {message: 'Password updated.', description: 'You can use your new password next time you log in.'}, error: false, success: true})
              ReactDOM.findDOMNode(this).querySelector('.password').blur();
              ReactDOM.findDOMNode(this).querySelector('.newPassword').blur();
            }
          })
        }
      })
    }
  }
  handleDelete(e){
    e.preventDefault();
    if(this.state.comments.value.length > 160){
      this.setState({errorMessage: {message: 'Your suggestion is too long.', description: 'Can you please make it less than 160 characters?'}, success: false, error: true})
    } else if(this.state.delete === 'Delete'){
      this.setState({delete: 'Confirm'}) 
    } else if(this.state.delete === 'Confirm'){
      fetch('/api/deleteaccount', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + JSON.parse(localStorage.login).token}, body: JSON.stringify({token: JSON.parse(localStorage.login).token, comments: this.state.comments.value ? this.state.comments.value : 'none'})})
      .then(response => response.json())
      .then(json => {
        if(json.success){
          localStorage.removeItem('login');
          window.location.pathname = '/';
        }
      })
    }
  }

  handleEmailChange(e){
    this.setState({success: false, error: false, email: {value: e.target.value}})
  }
  handleNameChange(e){
    this.setState({success: false, error: false, name: {value: e.target.value}})
  }
  handlePasswordChange(e){
    this.setState({success: false, error: false, password: {value: e.target.value}})
  }
  handleNewPasswordChange(e){
    this.setState({success: false, error: false, newPassword: {value: e.target.value}})
  }
  handleCommentsChange(e){
    this.setState({success: false, error: false, comments: {value: e.target.value}})
  }
  render(){
    if(!this.state.loading){
      return (
        <div className='ui container'>
          <div className='ui segment'>
            <Success successMessage={this.state.successMessage} success={this.state.success}/>
            <Error errorMessage={this.state.errorMessage} error={this.state.error}/>
            <div className="pb">
              <form onSubmit={this.handleEmailSubmit} className="ui form">
                <h1>Email Address</h1>
                <div className="ui divider"></div>
                <div className="field">
                  <label>Email Address</label>
                  <input type="email" value={this.state.email.value} onChange={this.handleEmailChange} placeholder="New Email Address"></input>
                </div>
                <button className="ui green button" type="submit">Update</button>
              </form>
            </div>
            <div className="pb">
              <form onSubmit={this.handleNameSubmit} className="ui form">
                <h1>Name</h1>
                <div className="ui divider"></div>
                <div className="field">
                  <label>Name</label>
                  <input type="text" value={this.state.name.value} onChange={this.handleNameChange} placeholder="New Name"></input>
                </div>
                <button className="ui green button" type="submit">Update</button>
              </form>
            </div>
            <div className="pb">
              <form onSubmit={this.handlePasswordSubmit} className="ui form">
                <h1>Password</h1>
                <div className="ui divider"></div>
                <div className="field">
                <label>Current Password</label>
                <input className='password' type="password" value={this.state.password.value} onChange={this.handlePasswordChange} placeholder="Current Password"></input>
                </div>
                <div className="field">
                  <label>New Password</label>
                  <input className='newPassword' type="password" value={this.state.newPassword.value} onChange={this.handleNewPasswordChange} placeholder="New Password"></input>
                </div>
                <button className="ui green button" type="submit">Update</button>
              </form>
            </div>
            <div className="pb">
              <form onSubmit={this.handleDelete} className="ui form">
                <h1>Delete Account</h1>
                <div className="ui divider"></div>
                <div className="field">
                <label>Is there something we should change?</label>
                <input placeholder='Let it all out!' onChange={this.handleCommentsChange}></input>
                <div className={this.state.comments.value.length > 160 ? 'mt fr red' : 'mt fr'}>{this.state.comments.value.length}/160</div>
                </div>
                <button className="ui red button" type="submit">{this.state.delete}</button>
              </form>
            </div>
          </div>
        </div>
      )
    } else {
      return <div className="ui active loader"></div>
    }
  }
}