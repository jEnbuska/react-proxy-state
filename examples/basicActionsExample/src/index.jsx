import React from 'react';
import {createProvider} from 'react-proxy-state';
import ReactDOM from 'react-dom';
import TodosApp from './components/TodosApp';
import * as todoEventHandlers from './eventHandlers/todos';

const initialState = {todos: {a: {id: 'a', description: 'Do Homework', done: false}}};

const customExtraParams = {loglog(){console.log('log')}}
const Provider = createProvider(initialState, {...todoEventHandlers}, customExtraParams);

const Root = () => (
    <Provider>
        <TodosApp/>
    </Provider>
);

ReactDOM.render(<Root/>, document.getElementById('app'));