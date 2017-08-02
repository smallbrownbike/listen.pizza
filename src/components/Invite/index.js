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
          <div className="header">Invite sent to {this.props.email}</div>
          <p>We're excited to have them! Tell them to keep an eye on their spam folder.</p>
        </div>
      )
    } else {
      return null
    }
  }
}

export default class Invite extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      email: {
        value: ''
      },
      loading: true,
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
      var token = JSON.parse(localStorage.getItem('login')).token;
      fetch('/api/invite', {method: 'POST', headers: {'content-type': 'application/json', 'Authorization': 'Bearer ' + token}, body: JSON.stringify({email: this.state.email.value})})
      .then(response => response.json())
      .then(json => {
        if(json.error){
          if(json.error === 'UserExists'){
            this.setState({errorMessage: {message: 'User already exists.', description: 'Looks like your friend already has an account. Cool?'}, error: true, success: false})
          } else if(json.error === 'OutOfInvites'){
            this.setState({errorMessage: {message: 'Out of invites!', description: 'You\'ve used up all of your invites. Sorry!'}, error: true, success: false})
          } else {
            this.setState({errorMessage: {message: 'User already invited', description: 'Looks like we\'ve already sent your friend an invite.'}, error: true, success: false})
          }
        } else if (json.success){
          this.setState({success: true, newUser: json.email, error: false, email: {value: ''}})
        }  
      })
    }
  }

  render(){
    if(this.props.invites <= 0){
      return(
        <div className="ui container"> 
          <div className="ui segment"> 
            <div className="ui error message">
              <div className="header">Out of invites!</div>
              <p>You've used up all of your invites. Sorry!</p>
            </div>
          </div>
        </div>
      )
    } else {
      return(
        <div className="ui container"> 
          <div className='ui segment'>
            <h1>Invite a friend</h1>
            <div className="ui divider"></div>
            <form onSubmit={this.handleSubmit} className="ui form">
              <Error error={this.state.error} errorMessage={this.state.errorMessage}/>
              <Success success={this.state.success} email={this.state.newUser}/>
              <div className="field">
                <label>What's your friend's email address?</label>
                <input value={this.state.email.value} onChange={this.handleEmailChange} type="email" placeholder="Email Address"></input>
              </div>
              <button className="ui green button" type="submit">Invite</button>
            </form>
          </div>
        </div>
      ) 
    }
  }
}