import func from './functions';

// Restore all elements
func.init();

// Listen for listMessages emission from server
socket.on('listMessages', messages => {
  // Display messages
  if (messages.length) {
    if (messages.length === 1) {
      // Add message first in messages array
      $scope.messages.unshift(messages[0]);
    } else {
      $scope.messages = messages;
    }

    try {
      $scope.$digest();
    } catch(e) {
      func.setStatus(e, 'danger');
      return 1;
    }
  }
});

// Listen for listUsers emission from server
socket.on('listUsers', users => {
  // Display users
  if (users.length) {
    if (users.length === 1) {
      // Add user first in users array (if not already there)
      let userExists = false;
      if ($scope.users.length === 0) {
        userExists = false;
      } else {
        for (let i = 0; i < $scope.users.length; i++) {
          if ($scope.users[i].name === users[0].name) {
            userExists = true;
            break;
          }
        }
      }
      if (!userExists)
        $scope.users.unshift(users[0]);
    } else {
      $scope.users = users;
    }

    try {
      $scope.$digest();
    } catch(e) {
      func.setStatus(e, 'danger');
      return 1;
    }
  }
});

// Listen for removeUser emission from server
socket.on('removeUser', nickName => {
  // Remove user from user array
  for (let i = 0; i < $scope.users.length; i++) {
    if ($scope.users[i].name === nickName) {
      $scope.users.splice(i, 1);
      $scope.$digest();
      break;
    }
  }
});

// Listen for status emission from server
socket.on('status', data => func.setStatus(data.message, data.type, data.which, data.clear, data.restore));

// Check nickname
global.$chatName.on('keyup change', e => {
  const $this = e.currentTarget
  , nick = $($this).val()
  , regex = /^[a-öA-Ö0-9_-]{3,}$/;
  // Only do the check if value is different from saved nickname
  if (nick === $scope.nick) {
    func.setStatus('', 'warning', 'nick');
  } else {
    if (nick.length === 0) {
      func.setStatus('', 'warning', 'nick');
    } else {
      if (!regex.test(nick)) {
        func.setStatus('Invalid name', 'danger', 'nick');
      } else {
        socket.emit('checkNick', nick);
        // Reset info text
        func.setStatus('', 'warning', 'nick');
      }
    }
  }
  // Prevent default events
  e.preventDefault();
});

socket.on('checkNick', cleared => {
  if (!cleared) {
    func.setStatus('Name occupied', 'danger', 'nick');
    global.$textarea.attr('disabled', true);
  } else {
    func.setStatus('Name OK', 'success', 'nick');
    global.$textarea.attr('disabled', false);
  }
});

// Listen for keydowns on textarea
global.$textarea.on("keydown", e => {
  const $this = e.currentTarget
  , nick = global.$chatName.val()
  , msg = $($this).val()
  , regex = /^\s*$/;
  if (e.which === 13 && e.shiftKey === false) {
    // debugger;
    if (regex.test(msg)) {
      func.setStatus('Message can\'t be empty', 'danger', 'status');
      // e.preventDefault();
    } else {
      // Store user nickname if not already stored
      if ($scope.nick === '') {
        $scope.nick = nick;
      } else {
        // If nick is stored, and it's been changed during same session
        // we have to remove old nick and replace with new
        if ($scope.nick !== nick) {
          socket.emit('removeUser', $scope.nick);
          $scope.nick = nick;
        }
      }

      // TODO: HTML or no HTML?
      socket.emit('insert', {
        name: $scope.nick,
        //message: msg
        message: (!global.VIEW_HTML) ? func.htmlspecialchars(msg) : msg
      });
    }
    // Prevent default events
    e.preventDefault();
  }
});

// Clear name status when name field loses focus
/*global.$chatName.on("blur", () => {
  func.setStatus('', 'warning', 'nick');
});*/
