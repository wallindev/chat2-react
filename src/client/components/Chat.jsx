import React from 'react';
import PropTypes from 'prop-types';

const Chat = ({ title }) => {

  return (
    <div id="chat-wrap" className="col-sm-9">
      <div className="panel panel-default">
        <div className="panel-heading">
          <h1 className="panel-title">{ title }</h1>
        </div>
        <div className="panel-body">
          <div id="instructions" className="small">
            <p>1. First choose a name. It may contain letters, numbers, the characters '_' and '-', must be at least three characters long and also not be the same as an already active user.</p>
            <p>2. When you've chosen a valid name, write your message in the textbox below.</p>
          </div>
          <div id="chat">
            <input type="text" id="chat-name" placeholder="Write your name" /> <span id="chat-name-msg"></span>
            <div id="chat-messages" tabIndex="-1">
              <div className="chat-message" ng-repeat="message in messages">
                <span id="message_date_{{ $index }}" ng-bind="message.created | date:'short'" className="small"></span> <br />
                <span id="message_name_{{ $index }}" ng-bind="message.name"></span>: <span id="message_message_{{ $index }}" ng-bind-html="message.message | html"></span>
              </div>
            </div>
            <textarea id="chat-textarea" placeholder="Write your message"></textarea>
            <div id="chat-status">
              Status: <span id="chat-status-text" className="text-warning"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Chat.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Chat;
