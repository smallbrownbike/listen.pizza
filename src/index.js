import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';
import Artist from './components/Artist';
import Menu from './components/Menu';
import Login from './components/Login';
import Album from './components/Album';
import Tag from './components/Tag';
import Collection from './components/Collection';
import Register from './components/Register';
import RegisterToken from './components/RegisterToken';
import Forgot from './components/Forgot';
import Reset from './components/Reset';
import './Index.css';

function CheckLoggedOut ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === false
        ? <Component {...props} />
        : <Redirect to={{pathname: '/collection', state: {from: props.location}}} />}
    />
  )
}
function CheckLoggedIn ({component: Component, authed, ...rest}) {
  return (
    <Route
      {...rest}
      render={(props) => authed === true
        ? <Component {...props} />
        : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
    />
  )
}
function authed(){
  if(localStorage.getItem('login')){
    if(Date.now() - JSON.parse(localStorage.getItem('login')).time < 3.6e+6){
      return true
    } else {
      return false
    }
  } return false;
}
ReactDOM.render(
  <BrowserRouter>
    <div>
      <Route path = '*' render={(props) => (<Menu {...props} authed={authed()}/>)}/>
      <CheckLoggedOut exact path='/' authed={authed()} component={Login} />
      <CheckLoggedOut authed={authed()} path='/login' component={Login} />
      <CheckLoggedOut authed={authed()} exact path='/register' component={Register} />
      <CheckLoggedOut path='/reset' authed={authed()} component={Reset} />
      <CheckLoggedOut authed={authed()} path='/register/invite' component={RegisterToken} />
      <Route path = '/forgot' render={(props) => (<Forgot {...props} authed={authed()}/>)}/>
      <Route path = '/artist/' render={(props) => (<Artist {...props} authed={authed()}/>)}/>
      <Route path = '/album' render={(props) => (<Album {...props} authed={authed()}/>)}/>
      <Route path = '/tag' render={(props) => (<Tag {...props} authed={authed()}/>)}/>
      <CheckLoggedIn authed={authed()} path='/collection' component={Collection} />
    </div>
  </BrowserRouter>,
  document.getElementById('root')
)