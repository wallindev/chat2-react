import React, { Component } from 'react';

import Chat from './Chat';
import Users from './Users';

import conf, { chatTitle } from '../js/config';

class ChatApp extends Component {
  constructor(props){
    super(props);

    this.state = {
      VIEW_HTML: conf.VIEW_HTML,
      STATUS: conf.STATUS,
    }
  }

  shouldComponentUpdate(nextProps, nextState) {

  }

  render() {
    return (
      <div id="mainContainer" className="container" ng-controller="ChatCtrl">
        <div className="row">
          <Chat
            title={ chatTitle }
          />
          <Users />
        </div>
      </div>
    );
  }

  componentDidMount() {
    // Messages and users arrays, nick placeholder
    let messages = [];
    let users = [];
    let nick = '';
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

  }
}

export default ChatApp;