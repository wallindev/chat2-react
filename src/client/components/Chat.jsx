import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Chat = ({
  title, instructions,
  nameStatus, messageStatus, nameStatusType, messageStatusType,
  nameStatusStyle, messageStatusStyle,
  messageDisabled,
  refTxtName,
  nameHandler, messageHandler,
  messages,
}) => {

  const divMessages = messages && messages.length > 0 && messages.map((message) => {
    const date = new Date(message.created);
    // Messages fetched from db has '_id' property, new messages in state only has 'socket' property (from socket.id)
    const idChatMessage = `chat_message_${message._id || message.socket}`;
    const idDate = `date_${message._id || message.socket}`;
    const idName = `name_${message._id || message.socket}`;
    const idMessage = `message_${message._id || message.socket}`;
    const shortDate = date.toUTCString();
    return <div key={ idChatMessage } className="chat-message">
  <span key={ idDate } className="small" style={{ display: 'block' }}>{ shortDate }</span>
  <span key={ idName } style={{ fontWeight: 500 }}>{ message.name }</span>: <span key={ idMessage } dangerouslySetInnerHTML={{ __html: message.message }} />
</div>});

  return (
    <div id="chat-wrap" className="col-sm-9">
      <div className="panel panel-default">
        <div className="panel-heading">
          <h1 className="panel-title">{ title }</h1>
        </div>
        <div className="panel-body">
          <div id="instructions" className="small" dangerouslySetInnerHTML={{ __html: instructions }} />
          <div id="chat">
            <input type="text" id="chat-name" placeholder="Write your name" ref={refTxtName} onChange={nameHandler} /> <span id="chat-name-msg" className={`text-${nameStatusType}`} style={nameStatusStyle}>{ nameStatus }</span>
            <div id="chat-messages" tabIndex="-1">
              { divMessages }
            </div>
            <textarea id="chat-textarea"
              placeholder="Write your message"
              onKeyDown={messageHandler}
              disabled={messageDisabled}
            />
            <div id="chat-status">
              Status: <span id="chat-status-text" className={`text-${messageStatusType}`} dangerouslySetInnerHTML={{ __html: messageStatus }} style={messageStatusStyle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Chat.propTypes = {
  title: PropTypes.string.isRequired,
  instructions: PropTypes.string.isRequired,
  nameStatus: PropTypes.string.isRequired,
  messageStatus: PropTypes.string.isRequired,
  nameStatusType: PropTypes.string.isRequired,
  messageStatusType: PropTypes.string.isRequired,
  nameStatusStyle: PropTypes.object,
  messageStatusStyle: PropTypes.object,
  messageDisabled: PropTypes.bool.isRequired,
  refTxtName: PropTypes.func.isRequired,
  nameHandler: PropTypes.func.isRequired,
  messageHandler: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Chat.defaultProps = {
  title: 'Chat2',
  instructions: '<p>Instructions here</p>',
};

export default Chat;
