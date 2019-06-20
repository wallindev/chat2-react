import React from 'react';
import ReactDOM from 'react-dom';
// import { render } from 'react-dom';

import ChatApp from './components/App';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(<ChatApp />, document.getElementById('chatApp'));
// render(<ChatApp />, document.getElementById('chatApp'));