import conf from './config';

// TODO:
const l = console.log;

/* To prevent users from emitting "dangerous" code to the server
  *
  * - Replace '&' with '&amp;'
  * - Replace '"' with '&quot;'
  * - Replace ''' with '&#039;'
  * - Replace '<' with '&lt;'
  * - Replace '>' with '&gt;'
  */
export const htmlspecialchars = str => {
  str.replace(/&/gim, '&amp;').replace(/"/gim, '&quot;').replace(/'/gim, '&#039;').replace(/</gim, '&lt;').replace(/>/gim, '&gt;')
};

// Sets status text at bottom or beside name
// CSS class 'text-warning' (from Bootstrap) is in spite of its name used for normal/idle mode,
// because the color '#8a6d3b' is suitable in this context for neutral notifications.
export const setStatus = (msg, type = 'info', which = 'status', clear = false, restore = true) => {
  if (msg === undefined) {
    console.error("msg can't be empty");
    return 1;
  }

  // TODO: Solve this with refs somehow?
  const lblName = document.getElementById('chat-name-msg');
  const lblStatus = document.getElementById('chat-status');

  if (which === 'name') {
    lblName.classList = `text-${type}`;
    lblName.innerHTML = msg;
  } else {
    lblStatus.classList = `text-${type}`;
    lblStatus.innerHTML = msg;

    // Reset status message after 5 seconds
    if (restore) {
      if (msg !== conf.STATUS) {
        setTimeout(() => {
          // TODO: Fix ES6 Version (Recursive function call)
          // var self = this;
          this.setStatus(conf.STATUS, 'warning');
          // lblStatus.classList = 'text-warning';
          // lblStatus.innerHTML = conf.STATUS;
        }, 5000);
      }
    }
  }
  if (clear)
    txtMessage.value = '';
};

export const clearStatus = () => {
  setStatus('', 'warning', 'name');
}

export const toggleTxtMessage = (disable = null) => {
  // TODO: Solve this with refs somehow?
  const txtMessage = document.getElementById('chat-textarea');

  // If forced with 'disable' argument
  l('disable:', disable);
  if (disable !== null) {
    disable ? txtMessage.setAttribute('disabled', 'disabled') : txtMessage.removeAttribute('disabled');
    return;
  }

  // If not forced, toggle disabled state
  const isDisabled = txtMessage.getAttribute('disabled');
  l('isDisabled:', isDisabled);
  isDisabled ? txtMessage.removeAttribute('disabled') : txtMessage.setAttribute('disabled', 'disabled');
}
