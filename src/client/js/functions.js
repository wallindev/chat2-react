// App initialization
const init = () => {
  // Restore all elements
  global.$chatStatusText.removeClass().addClass('text-warning');
  global.$textarea.val('');
  global.$textarea.attr('disabled', true);
  global.$chatName.val('');
  global.$chatName.focus();
};

/* To prevent users from emitting "dangerous" code to the server
  *
  * - Replace '&' with '&amp;'
  * - Replace '"' with '&quot;'
  * - Replace ''' with '&#039;'
  * - Replace '<' with '&lt;'
  * - Replace '>' with '&gt;'
  */
const htmlspecialchars = str => {
  str.replace(/&/gim, '&amp;').replace(/"/gim, '&quot;').replace(/'/gim, '&#039;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;')
};

// Sets status text at bottom or beside nick
const setStatus = (msg, type, which, clear, restore) => {
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
};
