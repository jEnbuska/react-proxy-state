Experimental library for managing React app state using Proxys

Works only on browsers that support Javascript Proxys

### 1. ContextProvider state
Context state is owned and served by ContextProvider Component, that lives in the component hierarchy root.
ContextProvider Component is created by `createProvider`function, that takes initial application state as 1st parameter.
```
import {createProvider} from 'react-proxy-state'
const ContextProvider = createProvider(initialState);
```
All direct and and recursive children of ContextProvider can subscribe to state changes from ContextProvider throught components context variable function `subscribe`. 
Context state can read by using components context variable function `getState`.

Context state should be an object, and it should be kept normalized. 

### 2. Map context state to props
Though context state can be manually be subscribed from context, Components should be defined by creating a higher-order component using 'mapContextToProps', that subscribes the context state changes on behave of the actual component. 
The actual Component will get the context state as properties.
```
import {mapContextToProps} from 'react-proxy-state';

const Todo = ({description, done}) => (
    <div>
      <p>{description}</p>
      <p>{done ? 'Done' : 'Not done'}</p>
    </div>
)

const selector = (contextState, ownProps) => {
  const todo = contextState.todos[ownProps.todoId];
  return todo;
}

export default mapContextToProps(selector)(Todos);
```
Function 'mapContextToProps' takes a state **selector** as parameter. The state selector is a function that takes contexts state and component own properties as parameter.
Every time Components properties or context state is changed, this functions is re-run, and what ever it returns it is passed as property to the actual component ******(if the output has changed)******. 

This higher order component passes the context state 

All context state should be kept normalized.
ContextProvider Component can be created by using *createProvider* function

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
