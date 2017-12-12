Experimental library for managing React app state using Proxys

Works only on browsers that support Javascript Proxys

## BS Api description
### 1. Context state
Context state is owned and served by ContextProvider Component, that lives in the component hierarchy root.

All direct and and recursive children of ContextProvider can subscribe to state changes from ContextProvider throught context variable function `subscribe`. 

State can read by using context variable function `getState`.

*(Though state can be manually subscribed from context, instead context state should be accessed by Components using 'mapContextToProps' higher-order component. Read more at 2. Mapping context state to Component properties)*

All context state should be kept normalized.
ContextProvider Component can be created by using *createProvider* function
```
import {createProvider} from 'react-proxy-state'
const ContextProvider = createProvider(initialState);
```
The first arguments of createProvider is the initial (context) state.


### 2. Every

## Build dependencies
  docker & docker-compose
## Build
  sh build.sh  

## Examples
### EventHandlers / ActionCreators 
##### Four functions: (clear, assign, remove, toggle) + state
```
import uuid from 'uuid/v4';

export const addTodo = (description) => ({todos}) => {
    const id = uuid();
    todos.assign({[id]: {id, description, done: false}});
};
export const toggleTodo = (id) => ({todos}) => todos[id].done.toggle();

export const removeTodo = (id) => ({todos}) => todos.remove(id);

export const removeAllTodos = () => ({todos}) => todos.clear({});

export const logTodosState= () => ({todos}) => console.log(todos.state)
```

### Create provider
```
import React from 'react';
import {createProvider} from 'react-proxy-state';
import ReactDOM from 'react-dom';
import TodosApp from './components/TodosApp';
import * as todoEventHandlers from './eventHandlers/todos';

const initialState = {
    todos: {a: {id: 'a', description: 'Do Homework', done: false}}
};

const ContextProvider = createProvider(initialState, {...todoEventHandlers});

const Root = () => (
    <ContextProvider>
        <TodosApp/>
    </ContextProvider>
);

ReactDOM.render(<Root/>, document.getElementById('app'));
```



### mapContextToProps
All eventHandlers are in context so there is no need to import them on mapContextToProps
```
import React, {Component} from 'react';
import {func} from 'prop-types';
import {mapContextToProps} from 'react-proxy-state';

class TodosApp extends Component {

    static contextTypes = {
        addTodo: func,
        toggleTodo: func,
        removeTodo: func,
        removeAllTodos: func,
    };

    state = {input: ''};

    render() {
        const {state: {input}, props: {todos}, context: {addTodo, toggleTodo, removeTodo, removeAllTodos}} = this;
        return (
            <div>
                {Object.values(todos).map(todo => (
                    <div key={todo.id}>
                        <p>{todo.description}</p>
                        <input type='checkbox' checked={todo.done} onClick={() => toggleTodo(todo.id)}/>
                        <button onClick={() => removeTodo(todo.id)}>remove</button>
                    </div>
                ))}
                <input value={input} onChange={e => this.setState({input: e.target.value})}/>
                <button onClick={() => addTodo(input)}>add</button>
                <button onClick={removeAllTodos}>remove all</button>
            </div>
        );
    }
}

export default mapContextToProps(({todos}) => ({todos}))(TodosApp);
```
```

import React from 'react';
import {func} from 'prop-types';

const TodoItem = ({todo}, {toggleTodo, removeTodo}) => (
    <div>
        <p>{todo.description}</p>
        <input type='checkbox' checked={todo.done} onClick={() => toggleTodo(todo.id)}/>
        <button onClick={() => removeTodo(todo.id)}>remove</button>
    </div>
);

TodoItem.contextTypes = {
    toggleTodo: func,
    removeTodo: func,
};

export default TodoItem;
```

![react-proxy-state flow](https://user-images.githubusercontent.com/11061511/33515232-ef719c38-d768-11e7-927e-fcdbfaeda470.png)
  
### Caveats examples
```
function eventHandler(){
    (root) => {
      root.assign({a: undefined, b: false, c: {}})
      root.state            // {a: undefined, b: false, c: {}}
      root.a                // undefined
      root.b                // [object Branch]
      !!root.a              //false
      !!root.b              //true
      root.b.state          //false
      root.c.toggle().state //false
    }
}
```
