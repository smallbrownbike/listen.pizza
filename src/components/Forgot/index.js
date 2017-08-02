import React from 'react'

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
          <div className="header">Reset instructions sent to {this.props.email}</div>
          <p>Please check your email for instructions on how to reset your password.</p>
        </div>
      )
    } else {
      return null
    }
  }
}

export default class Forgot extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      email: {
        value: ''
      },
      error: false,
      success: false
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  };
  handleEmailChange(e){
    this.setState({success: false, error: false, email: {value: e.target.value}})
  }
  handleSubmit(e){
    e.preventDefault();
    if(!this.state.email.value){
      this.setState({errorMessage: {message: 'No email address entered.', description: 'Please enter a valid email address.'}, error: true})
    } else {
      fetch('/api/forgot', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({username: this.state.email.value})})
      .then(response => response.json())
      .then(json => {
        if(json.error){
          if(json.error === 'NoUser'){
          this.setState({errorMessage: {message: 'Account not found.', description: 'We couldn\'t find an account associated with that email address.'}, error: true, success: false})
          }
        } else {
          if(json.success){
            this.setState({email: {value: ''},user: json.success, success: true, error: false})
          }
        }
      })
    }
  }
  render(){
    return(
      <div className={this.props.modal ? "ui container" : "lm ui container"}> 
        <div className='ui segment'>
          <h1>Forgot Password</h1>
          <div className="ui divider"></div>
          <form onSubmit={this.handleSubmit} className="ui form">
            <Success success={this.state.success} email={this.state.user}/>
            <Error error={this.state.error} errorMessage={this.state.errorMessage}/>
            <div className="field">
              <label>What's your email address?</label>
              <input value={this.state.email.value} onChange={this.handleEmailChange} type="email" placeholder="Email Address"></input>
            </div>
            <button className="ui green button" type="submit">Reset</button>
          </form>
        </div>
      </div>
    )
  }
}