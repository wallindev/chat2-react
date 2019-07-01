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
