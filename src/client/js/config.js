export const chatTitle = 'Chat2';

export const instructions = `<p>1. First choose a name. It may contain letters, numbers, the characters '_' and '-', must be at least three characters long and also not be the same as an already active user.</p>
<p>2. When you've chosen a valid name, write your message in the textbox below.</p>`;

export const userHeading = 'Active users';

export default {
  // Constants
  VIEW_HTML: true,
  NAME_STATUS: '',
  MESSAGE_STATUS: 'Idle',
  NAME_STATUS_TYPE: 'warning', // CSS style name from Bootstrap, in this context used as color for default state
  MESSAGE_STATUS_TYPE: 'warning', // -"-
  NAME_STATUS_TIMEOUT: 4000,
  MESSAGE_STATUS_TIMEOUT: 4000,
};
