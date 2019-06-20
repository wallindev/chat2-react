import React from 'react';

const noUsers = <div ng-show="!users.length">
  No users
</div>;

const Users = (props) => {
  return (
    <div id="user-wrap" className="col-sm-3">
      <div className="panel panel-default">
        <div className="panel-heading">Active users</div>
        <div className="panel-body">
          <div id="chat-users">
            { noUsers }
            <div className="chat-user text-primary strong" ng-repeat="user in users">
              <strong>user.name</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Users;
