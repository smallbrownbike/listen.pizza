import React from 'react'
import { Link } from 'react-router-dom'

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

////Main
var token;
export default class RegisterToken extends React.Component{
   constructor(props){
    super(props);

    this.state = {
      email: {
        value: ''
      },
      name: {
        value: ''
      },
      password: {
        value: ''
      },
      loading: true,
      fatalError: false,
      error: false,
      counter: 0
    }
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };
  componentDidMount(){
    fetch('/api/invitetoken', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({token: window.location.pathname.slice(17)})})
    .then(response => response.json())
    .then(json => {
      if(json.valid){
        token = json.token;
        this.setState({loading: false})
      }else{
        this.setState({errorMessage: {message: 'Your invite is invalid.', description: 'Please refer to your invitation email for a valid invite link.'}, fatalError: true, loading: false})
      }
    })
  }
  handleSubmit(e){
    e.preventDefault();
    if(!this.state.password.value || !this.state.name.value || !this.state.email.value){
      this.setState({errorMessage: {message: 'Missing some info...', description: 'Please fill out all fields.'}, error: true})
    } else if(this.state.name.value.length >= 35) {
      this.setState({errorMessage: {message: 'Woah! That username is huge!', description: 'Can you please make it less than 35 characters?'}, error: true})
    } else {
      if(this.state.counter === 0){
        this.setState({counter: 1})
        var name = this.state.name.value
        var email = this.state.email.value
        var password = this.state.password.value
        fetch('/api/register', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({token: token, name: name, email: email, password: password})})
        .then(response => response.json())
        .then(json => {
          if(json.error){
            if(json.error.name === 'UserExistsError'){
              this.setState({counter: 0, errorMessage: {message: 'Looks like you already have an account...', description: <Link to='/login' className='pointer'>Click here to log in.</Link>}, error: true})
            }
            if(json.error === 'InvalidToken'){
              this.setState({errorMessage: {message: 'Your invite is invalid.', description: 'Please refer to the link in your email for a valid invite link.'}, fatalError: true, loading: false})
            }
          } else {
            this.setState({loading: true})
            fetch('/api/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: this.state.email.value, password: this.state.password.value})})
            .then(response => response.json())
              .then(json => {
                localStorage.setItem('login', JSON.stringify({name: json.name, username: json.username, token: json.token, time: Date.now()}));window.location.pathname = '/collection'
            })
          }
        }) 
      }
    }
  }
  handleNameChange(e){
    this.setState({name: {value: e.target.value}})
  }
  handleEmailChange(e){
    this.setState({error: false, email: {value: e.target.value}})
  }
  handlePasswordChange(e){
    this.setState({error: false, password: {value: e.target.value}})
  }
  
  render(){
    if(!this.state.loading){
      if(this.state.fatalError){
        return(
          <div className='lm ui container'>
            <div className='ui segment'>
              <Error error={true} errorMessage={this.state.errorMessage}/>
            </div>
          </div>
        )
      } else {
        return(
            <div className='lm ui container'>
              <div className='ui segment'>
                <title>Register</title>
                <h1>Sign Up</h1>
                <div className="ui divider"></div>
                <form onSubmit={this.handleSubmit} className="ui form">
                  <Error error={this.state.error} errorMessage={this.state.errorMessage}/>
                  <div className="field">
                    <label>First Name</label>
                    <input value={this.state.name.value} onChange={this.handleNameChange} type="text" name="name" placeholder="Or whatever you'd like us to call you."></input>
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input value={this.state.email.value} onChange={this.handleEmailChange} type="email" name="email" placeholder="Your email address."></input>
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input value={this.state.password.value} onChange={this.handlePasswordChange} type="password" name="password" placeholder="Special secret password. Shhhh..."></input>
                  </div>
                  <button className="ui black button" type="submit">Sign Up</button>
                </form>
                <div className='mt pointer'>
                  <strong><Link to='/login'>Already have an account?</Link></strong>
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