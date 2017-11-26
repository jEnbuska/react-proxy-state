import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

import Provider from './context';

const Root = () => (
  <Provider>
    <App />
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('app'));