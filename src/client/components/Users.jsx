import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Users = ({ heading, users }) => {
  const divUsers = users.length === 0 ? <div key="0">No users</div> :

  users.map((user) => {
    const idUser = `user_${user.socket}`;
    return <div key={idUser} className="chat-user text-primary strong">
      <strong>{ user.name }</strong>
    </div>
  });

  return (
    <div id="user-wrap" className="col-sm-3">
      <div className="panel panel-default">
        <div className="panel-heading">{ heading }</div>
        <div className="panel-body">
          <div id="chat-users">
            { divUsers }
          </div>
        </div>
      </div>
    </div>
  );
};

Users.propTypes = {
  heading: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Users.defaultProps = {
  heading: 'Users',
};

export default Users;
