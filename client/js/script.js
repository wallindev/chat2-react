'use strict';
/*
 * "Namespace" chatApp
 *
 */
const chatApp = angular.module('chatApp', [/*'ngSanitize'*/])
// Variables factory
.factory('global', () => {
  return {
    // Constants
    VIEW_HTML   : true,
    STATUS      : 'Idle',
    // DOM objects
    $messages   : $('#chat-messages'),
    $textarea   : $('#chat-textarea'),
    $chatName   : $('#chat-name'),
    $chatNameMsg  : $('#chat-name-msg'),
    $chatStatus   : $('#chat-status'),
    $chatStatusText : $('#chat-status-text'),
    $chatUsers    : $('#chat-users')
  };
// Functions factory
}).factory('func', global => {
  return {
    // App initialization
    init: () => {
      // Restore all elements
      global.$chatStatusText.removeClass().addClass('text-warning');
      global.$textarea.val('');
      global.$textarea.attr('disabled', true);
      global.$chatName.val('');
      global.$chatName.focus();
    },
    /* To prevent users from emitting "dangerous" code to the server
     *
     * - Replace '&' with '&amp;'
     * - Replace '"' with '&quot;'
     * - Replace ''' with '&#039;'
     * - Replace '<' with '&lt;'
     * - Replace '>' with '&gt;'
     */
    htmlspecialchars: str => str.replace(/&/gim, '&amp;').replace(/"/gim, '&quot;').replace(/'/gim, '&#039;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;'),
    // Sets status text at bottom or beside nick
    setStatus: (msg, type, which, clear, restore) => {
      if (msg === undefined) {
        console.error("msg can't be empty");
        return 1;
      }
      if (type === undefined) type = 'info';
      if (which === undefined) which = 'status';
      if (clear === undefined) clear = false;
      if (restore === undefined) restore = true;

      if (which === 'nick') {
        global.$chatNameMsg.removeClass().addClass('text-' + type);
        global.$chatNameMsg.html(msg);
      } else {
        global.$chatStatusText.removeClass().addClass('text-' + type);
        global.$chatStatusText.html(msg);

        // Reset status message after 5 seconds
        if (restore) {
          if (msg !== global.STATUS) {
            setTimeout(() => {
              // TODO: Fix ES6 Version (Recursive function call)
              // var self = this;
              // self.setStatus(global.STATUS, 'warning');
              global.$chatStatusText.removeClass().addClass('text-warning');
              global.$chatStatusText.html(global.STATUS);
            }, 5000);
          }
        }
      }
      if (clear)
        global.$textarea.val('');
    }
  };
// Socket factory
}).factory('socket', () => {
  const currentUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '')
  , socketProtocol = 'ws:'
  , socketHost = location.hostname
  // If run on OpenShift server we have to set websocket port to 8000
  // otherwise same as current http port (to avoid CORS - Cross-origin resource sharing - conflict)
  , socketPort = (location.port) ? location.port : 8000
  , socketUrl = socketProtocol + '//' + socketHost + ':' + socketPort;

  let socket;
  try {
    socket = io.connect(socketUrl);
  } catch (e) {
    console.error('Error: ', e.message);
  }

  if (socket === undefined) {
    console.error('Error: socket undefined');
    return 1;
  } 
  return socket;
})
// Custom exception handling
.factory('$exceptionHandler', () => exception => {throw exception})
// Custom filter (to allow HTML generation in bindings)
.filter('html', $sce => val => $sce.trustAsHtml(val))
// Main controller
.controller('ChatCtrl', (global, func, socket, $scope, $exceptionHandler, $sce) => {
  // Messages and users arrays, nick placeholder
  $scope.messages   = []
  , $scope.users    = []
  , $scope.nick   = '';

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
    , nick  = $($this).val()
    , regex   = /^[a-öA-Ö0-9_-]{3,}$/;
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
    , nick  = global.$chatName.val()
    , msg   = $($this).val()
    , regex   = /^\s*$/;
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
});
