import React, { Component } from 'react';

import conf, { chatTitle, instructions, userHeading } from '../js/config';
import { htmlspecialchars } from '../js/functions';
import { getSocket } from '../js/socket';
import eventHandlers from '../js/eventHandlers';

import Chat from './Chat';
import Users from './Users';

export default class ChatApp extends Component {
  state = {
    name: '',
    message: '', // TODO: Is this used?
    nameStatus: '',
    messageStatus: conf.MESSAGE_STATUS,
    nameStatusType: conf.NAME_STATUS_TYPE,
    messageStatusType: conf.MESSAGE_STATUS_TYPE,
    nameStatusStyle: { opacity: 1 },
    messageStatusStyle: { opacity: 1 },
    messageDisabled: true,
    messages: [],
    users: [],
  };

  render = () => {
    return (
      <React.StrictMode>
      <div id="mainContainer" className="container">
        <div className="row">
          <Chat
            title={chatTitle}
            instructions={instructions}
            nameStatus={this.state.nameStatus}
            messageStatus={this.state.messageStatus}
            nameStatusType={this.state.nameStatusType}
            messageStatusType={this.state.messageStatusType}
            nameStatusStyle={ this.state.nameStatusStyle }
            messageStatusStyle={ this.state.messageStatusStyle }
            messageDisabled={this.state.messageDisabled}
            refTxtName={el => {this.domRefs.txtName = el}}
            nameHandler={this.handleName}
            messageHandler={this.handleMessage}
            messages={this.state.messages}
          />
          <Users
            heading={userHeading}
            users={this.state.users}
          />
        </div>
      </div>
      </React.StrictMode>
    );
  }

  /*
   * Custom class variables (public class fields)
   */

  // Global socket object
  socket = getSocket();

  // Reference(s) to the DOM elements of child components
  domRefs = {};

  /*
   * Custom class methods
   */

  // Alias function for new setState() form
  setStateCB = (newState) => {
    // Short form
    this.setState((prevState, props) => (newState));
    // Long form
    // this.setState((prevState, props) => {
    //   return newState;
    // });
  }

  // Use domRefs to manipulate child DOM elements
  initDomElements = () => {
    this.domRefs.txtName.focus();
  }

  handleName = (e) => {
    const name = e.target.value
    // Check if name is valid
    if (!eventHandlers.checkName(name, this.state.name)) {
      this.setStateCB({ nameStatus: 'Invalid name', nameStatusType: 'danger', messageDisabled: true });
      return;
    }

    // Save name to state and clear error message (if any)
    this.setStateCB({ name, nameStatus: '', nameStatusType: conf.NAME_STATUS_TYPE });
    // this.restoreNameStatus();
    // Check if name is already used
    this.socket.emit('checkName', name);
  }

  handleMessage = (e) => {
    const msg = e.target.value;
    // User pressed only Enter key, not with Shift or Ctrl key
    if (e.which === 13 && e.shiftKey === false && e.ctrlKey === false) {
      // Prevent newline (Enter key) to get in message
      e.preventDefault();
      // Check if name is valid
      if (!eventHandlers.checkMessage(msg, this.state.name, this.domRefs.txtName.value)) {
        this.setStateCB({ messageStatus: 'Message can\'t be empty', messageStatusType: 'danger' });
        this.restoreMessageStatus();
        return;
      }

      // Send message to server to be inserted in db
      this.socket.emit('insert', {
        socket: this.socket.id,
        name: this.state.name,
        message: (!conf.VIEW_HTML) ? htmlspecialchars(msg) : msg
      });

      // Clear message box
      e.target.value = '';
    }
  }

  // Uses setTimeOut and CSS transitions to wait, fade out old msg, fade in new msg
  // Need to clear timer every time so only the latest is in effect
  restoreNameStatus = () => {
    this.nameStatusTimer ? this.nameStatusTimer.forEach(timer => clearTimeout(timer)) : this.nameStatusTimer = [];
    this.nameStatusTimer[0] = setTimeout(() => {
      this.setStateCB({ nameStatusStyle: { opacity: 0 } });
    }, conf.NAME_STATUS_TIMEOUT);
    this.nameStatusTimer[1] = setTimeout(() => {
      this.setStateCB({ nameStatus: conf.NAME_STATUS, nameStatusType: conf.NAME_STATUS_TYPE })
    }, (conf.NAME_STATUS_TIMEOUT + 250));
    this.nameStatusTimer[2] = setTimeout(() => {
      this.setStateCB({ nameStatusStyle: { opacity: 1 } });
    }, (conf.NAME_STATUS_TIMEOUT + 500));
  }

  // Uses setTimeOut and CSS transitions to wait, fade out old msg, fade in new msg
  // Need to clear timer every time so only the latest is in effect
  restoreMessageStatus = () => {
    this.messageStatusTimer ? this.messageStatusTimer.forEach(timer => clearTimeout(timer)) : this.messageStatusTimer = [];
    this.messageStatusTimer[0] = setTimeout(() => {
      this.setStateCB({ messageStatusStyle: { opacity: 0 } });
    }, conf.MESSAGE_STATUS_TIMEOUT);
    this.messageStatusTimer[1] = setTimeout(() => {
      this.setStateCB({ messageStatus: conf.MESSAGE_STATUS, messageStatusType: conf.MESSAGE_STATUS_TYPE })
    }, (conf.MESSAGE_STATUS_TIMEOUT + 250));
    this.messageStatusTimer[2] = setTimeout(() => {
      this.setStateCB({ messageStatusStyle: { opacity: 1 } });
    }, (conf.MESSAGE_STATUS_TIMEOUT + 500));
  }

  /*
   * Lifecycle methods
   */
  componentDidMount = () => {
    // Clear all DOM elements
    this.initDomElements();

    // Name already used?
    this.socket.on('checkName', cleared => {
      if (!cleared) {
        this.setStateCB({ nameStatus: 'Name occupied', nameStatusType: 'danger', messageDisabled: true });
      } else {
        this.setStateCB({ nameStatus: 'Name OK', nameStatusType: 'success', messageDisabled: false });
        this.restoreNameStatus();
      }
    });

    // Listen for listMessages emission from server
    this.socket.on('listMessages', messages => {
      // Display messages
      if (messages.length) {
        // User sent message, add message first in messages array
        if (messages.length === 1) {
          this.setState({ messages: [messages[0], ...this.state.messages]});
        } else { // Messages fetched from db
          this.setState({ messages });
        }
      }
    });

    // Listen for listUsers emission from server
    this.socket.on('listUsers', users => {
      // Display users
      if (users.length) {
        if (users.length === 1) {
          // Add user first in users array (if not already there)
          let userExists = false;
          if (this.state.users.length === 0) {
            userExists = false;
          } else {
            for (let i = 0; i < this.state.users.length; i++) {
              if (this.state.users[i].name === users[0].name) {
                userExists = true;
                break;
              }
            }
          }
          if (!userExists)
            this.setState({ users: [users[0], ...this.state.users]});
        } else {
          this.setState({ users });
        }
      }
    });

    // Listen for removeUser emission from server
    this.socket.on('removeUser', name => {
      // Remove user from user array
      for (let i = 0; i < this.state.users.length; i++) {
        if (this.state.users[i].name === name) {
          this.state.users.splice(i, 1);
          this.setState({ users });
          break;
        }
      }
    });

    // Listen for status emission from server
    this.socket.on('status', data => {
      this.setStateCB({ messageStatus: data.message, messageStatusType: data.type });
      this.restoreMessageStatus();
    });
  }
};
