import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

////Error
class Error extends React.Component{
  render(){
    if(this.props.error){
      return(
        <div className="ui error message">
          <div className="header">{this.props.errorMessage ? this.props.errorMessage.message : 'The current password is incorrect.'}</div>
          <p>{this.props.errorMessage ? this.props.errorMessage.description : 'Please try again.'}</p>
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
    return(
      <div className="ui positive message">
        <div className="header">Password updated. Cool!</div>
        <p>You'll be redirected to the login page in {this.props.counter} seconds.</p>
      </div>
    )
  }
}

////Main
var token;
export default class Reset extends React.Component{
  componentDidMount(){
    fetch('/api/resettoken', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({token: window.location.pathname.slice(7)})})
    .then(response => response.json())
    .then(json => {
      if(json.valid){
        token = json.token;
        this.setState({loading: false})
      }else{
        this.setState({errorMessage: {message: 'Your reset has expired.', description: <Link to='/forgot' className='pointer'>Click here to request another password reset email.</Link>}, fatalError: true, loading: false})
      }
    })
  }
  constructor(props){
    super(props);
    this.state = {
      password: {
        value: ''
      },
      loading: true,
      error: false,
      counter: 5,
      complete: false
    }
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };
  handleSubmit(e){
    var password = this.state.password.value
    e.preventDefault();
    if(!password){
      this.setState({errorMessage: {message: 'Missing some info...', description: 'Please fill out all fields.'}, error: true})
    } else {
      fetch('/api/resetpassword', {method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token}, body: JSON.stringify({token: token, password: password})})
      .then(response => response.json())
      .then(json => {
        if(!json.success){
          this.setState({errorMessage: {message: 'Your reset has expired.', description: <Link to='/forgot' className='pointer'>Click here to request another password reset email.</Link>}, fatalError: true, loading: false})
        } else {
          this.setState({complete: true, error: false})
          setTimeout(()=>{window.location.pathname = 'login'}, 5000)
          var counter = setInterval(() => {if(this.state.counter > 0){this.setState({counter: this.state.counter - 1})} else {clearInterval(counter)}}, 1000)
        }
      })
    }
  }
  handlePasswordChange(e){
    this.setState({password: {value: e.target.value}})
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
        if(!this.state.complete){
        return (
            <div className='lm ui container'>
              <div className='ui segment'>
                <h1>Reset Password</h1>
                <div className="ui divider"></div>
                <form onSubmit={this.handleSubmit} className="ui form">
                  <Error errorMessage={this.state.errorMessage} error={this.state.error}/>
                  <div className="field">
                    <label>New Password</label>
                    <input type="password" value={this.state.password.value} onChange={this.handlePasswordChange} placeholder="New Password"></input>
                  </div>
                  <button className="ui green button" type="submit">Reset</button>
                </form>
              </div>
            </div>
          )
        } else {
          return (
            <div className='lm ui container'>
              <div className='ui segment'>
                <Success counter={this.state.counter}/>
            </div>
            </div>
          )
        }
      }
    } else {
      return <div className="ui active loader"></div>
    }
  }
}