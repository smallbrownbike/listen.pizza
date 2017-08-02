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

////Success
class Success extends React.Component{
  render(){
    return(
      <div className="ui positive message">
        <div className="header">Cool!</div>
        <p>We'll send you an invite as soon as we can.</p>
      </div>
    )
  }
}

class Form extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      email: {
        value: ''
      },
      success: false,
      error: false,
      hidden: false
    }
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e){
    e.preventDefault();
    fetch('/api/requestinvite', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: this.state.email.value})})
    .then(response => response.json())
    .then(json => {
      if(json.success){
        this.setState({error: false, success: true})
      } else if(json.error) {
        if(json.error === 'UserExists'){
          this.setState({errorMessage: {message: 'Looks like you already have an account...', description: <Link to='/login' className='pointer'>Click here to log in.</Link>}, error: true})
        } else {
          this.setState({errorMessage: {message: 'Looks like you already requested an invite!', description: 'We\'ll let you know when we\'re ready for you.'}, error: true})
        }
      }
    })
  }
  handleEmailChange(e){
    this.setState({success: false, error: false, hidden: true, email: {value: e.target.value}})
  }
  
  render(){
    if(!this.state.success){
      return(
        <div>
          <form onSubmit={this.handleSubmit} className="ui form">
            <Error error={this.state.error} errorMessage={this.state.errorMessage}/>
            <div className="field">
              <label>Email Address</label>
              <input type="email" value={this.state.email.value} onChange={this.handleEmailChange} name="email" placeholder="Email Address"></input>
            </div>
            <button className="ui black button" type="submit">Submit</button>
          </form>
          <div className='mt pointer'>
            <strong><Link to='/login'>Already have an account?</Link></strong>
          </div>
        </div>
      )
    } else {
      return (
        <div className='ui container'>
          <Success />
        </div>
      )
    }
  }
}

////Main
export default class Register extends React.Component{
  

  render(){    
    return(
      <div className='lm ui container'>
        <div className='ui segment'>
          <title>Register</title>
          <div className="ui icon message">
            <i className="frown icon"></i>
            <div className="content">
              <div className="header">
                Registration is currently closed.
              </div>
              <p>Enter your email address below to request an invite.</p>
            </div>
          </div>
          <h1>Request an invite</h1>
          <div className="ui divider"></div>
          <Form />
        </div>
      </div>
    )
  }
}