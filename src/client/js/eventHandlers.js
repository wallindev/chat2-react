// TODO:
const l = console.log;
export default {
  // Check nickname
  checkName: (name, curName) => {
    if (!name || name === '')
      return;

    // Matches 'Michael J. Fox'
    const regex = /^([a-öA-Ö0-9_\.-]{3,})(\s?)([a-öA-Ö0-9_\.-]*)(\s?)([a-öA-Ö0-9_\.-]*)$/;
    // Only do the check if value is different from saved nickname
    if (name === curName)
      return true;
    else
      return regex.test(name) ? true : false;
  },

  // Listen for keydowns on textarea
  checkMessage: (msg, curName, name) => {
    if (!msg || msg === '')
      return;

    // Match for zero or more whitespaces, anything else goes
    const regex = /^\s*$/;

    // Trim leading and trailing whitespace
    msg = msg.trim();

    return !regex.test(msg) ? true : false;

      // TODO: Do we really need this?
      /* // Store user nickname if not already stored
      if (curName === '') {
        // TODO: Must save new name to state
        curName = name;
      } else {
        // If name is stored, and it's been changed during same session
        // we have to remove old name and replace with new
        if (curName !== name) {
          socket.emit('removeUser', curName);
          curName = name;
        }
      } */
  }
};
