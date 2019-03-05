import React, { Component } from 'react';
import { Switch } from 'react-router-dom';

import ReactAlert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

import { PublicRoute } from './components/PublicRoute.js';
import { PrivateRoute } from './components/PrivateRoute.js';
import { Error } from './components/error/Error.js';
import { PicturesDisplay } from './components/images/Dropzone';

import { Sign } from './components/sign/Sign.js';
import { ResetPassword } from './components/sign/ResetPassword.js';
import { ValidateAccount } from './components/sign/ValidateAccount.js';
import { LockedAccount } from './components/sign/LockedAccount.js';

class App extends Component {

  render() {
    return (
      <div className="App">
        <ReactAlert stack={{limit: 5}} html={true} />
        <PicturesDisplay />

        <div className="App-content">
          <Switch>
            <PublicRoute path="/user/validateAccount" component={ValidateAccount}/>
            <PublicRoute path="/user/lockedAccount" component={LockedAccount}/>
            <PublicRoute path="/user/resetPassword" component={ResetPassword}/>
            <PublicRoute path="/user/sign/:state" component={Sign}/>
            <PublicRoute path="/user/sign" component={Sign}/>
            <PublicRoute path="/error" component={Error}/>

            <PrivateRoute exact path='/home' page={"home"} />
            <PrivateRoute exact path='/account' page={"account"} />
            <PrivateRoute exact path='/chat' page={"chat"} />
            <PrivateRoute exact path='/' page="home" />

            <PublicRoute path='/' component={Error} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;