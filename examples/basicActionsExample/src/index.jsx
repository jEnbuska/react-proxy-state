import 'styles';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import * as actions from './actions'
import {CreateProvider } from '../../../src';

const Provider = CreateProvider({todos: {}}, actions);

const Root = () => (
  <Provider initialState={{todos: {}}} actions={actions}>
    <App />
  </Provider>
);

ReactDOM.render(<Root />, document.getElementById('app'));