Experimental library for managing React app state using Proxys

Works only on browsers that support Javascript Proxys

Table of contents
=================

  * [Examples](#examples)
    * [Event Handlers](#event-handlers)
    * [Create Provider](#createprovider)
    * [mapContextToProps](#mapcontexttoprops)
    * [Caveats](#caveats)
  * [Flow Diagram](#flow)
  * [Api](#api)


Examples
========

Event Handlers
-------------

###### Four functions: (clear, assign, remove, toggle) + state
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

### createProvider
------------------
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
--------------------
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
  
Caveats
-------
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


### 1. Context State
Context state is owned and served by ContextProvider Component, that lives in the component hierarchy root.
ContextProvider Component is created by `createProvider`function, that takes initial application state as 1st parameter.
```
import {createProvider} from 'react-proxy-state'
const ContextProvider = createProvider(initialState);

const Root = () => (
    <ContextProvider>
        <App/>
    </ContextProvider>
);
```
All direct and recursive children of ContextProvider can subscribe to state changes from ContextProvider throught components context variable function `subscribe`. 
Context state can be read by using components context variable function `getState`.

Context state should always be kept normalized. 

### 2. Map context state to props
Though context state can be manually be subscribed from context, Components should be defined by creating a higher-order component using 'mapContextToProps', that subscribes the context state changes on behave of the actual component. 

The higher-order component is called *Connector*
The actual Component will get the context state as properties from the Connector component.
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

This function return a function that that accepts the actual component as parameter.

Every time Components properties or context state is changed, selector functions is re-run, and what ever it returns it is passed as property by Connector to the actual component *(if the output changes compared to the previous output)*. 

### 3. Contexts eventHandler Provider
Event handlers are functions that are responsible for updating the context state.

These functions must be defined as functions that return a new function.

These functions are passed to `createProvider` as the second function parameter.
```
const setTodoDone = (todoId, done) => proxy => proxy.todos[todoId] = done;
const eventHandlers = {setTodoDone, ...others}
const ContextProvider = createProvider(initialState, eventHandlers);
```

Event handler functions are served to Components by ContextProvider.

Components can access ContextProviders eventhandlers directly from component context *(assuming components contextTypes have been defined)*.

```
import {func} from 'prop-types';
...
const Todo = ({id, description, done}, {setTodoDone}) => (
    <div>
      <p>{description}</p>
      <p onClick={() => setTodoDone(id, !done)}>{done ? 'Done' : 'Not done'}</p>
    </div>
)
Todo.contextTypes = {
  setTodoDone: func
}
const selector = ...
export default mapContextToProps(selector)(Todos);
```

Everytime component invokes any of the contexts eventHandler, ContextProvider will take the output of this function and invoke it with a ***Proxy*** that represents the context state.

\*Every change that is directed to this Proxy:s is registered, and all those changes will be performed using pathcopying, without changing the actual underlaying context state. 
When ever context state changes all Connector subscribers will be notified about the changed state.

***Read more about how how changes to state Proxy should be applied on next chapter***

### 4. Eventhandler Proxies
Context state proxie that is passed to eventhandler outputs is a Proxy of ***Branch*** instance.
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

Branches are nodes in a tree like datastructure that's role as a whole is to represent the underlying context state.
###### These Branch datastructures nodes are created 'just in time' when an eventHandler accesses a particular states node for the first time 

A single Branch node providers an interface for reading and updating the particular node of the state.

The benefit of using Branch Proxies is, that all the updates are applied by automatical using pathcopying.

#### State
Every Branch node represents a particular location of the state, that state or substate can be read by accessing the Branches  ***state*** variable
```
const logTodoStatus = (which) => (proxy) => {
    const status = proxy.todos[which].done.state;
    console.log(status); // --> true or false
}
```
Note that the state variable is a getter, and it is always evaluated when it is accessed. 

You should never be directly try to changed or mutate this state.



There is four methods that are recommended to be used when ever the underlying data should be updated.

#### Clear
Even thought Branch instances are able to handle direct variable assigments there is a lot of edge cases when this does not work.
Clear is the function that should be used instead of direct assigment
```
const updateA = (update) => proxy => {
    proxy.a = update; // This should be avoided
}
...
const updateA = (update) => proxy => {
    proxy.a.clear(update);
}

```
#### Assign
Use assign when ever you would use Object.assign
```
const updateB = (update) => proxy => {
    Object.assign(proxy.b, update); // This should be avoided
}
...
const updateB = (update) => proxy => {
    proxy.b.assign(update);
}
```
#### Remove
Do not use javascript native delete keyword when changing context state.
When ever there is a need o remove any data use remove:
```
const handleRemove = (from, ...targets) => proxy => {
    proxy[from].remove(...targets)
}
```

#### Toggle
Changes boolean true to false and false to true
```
const doToggle = (who) => proxy => {
    proxy[who].toggle()
}
```

Build
=====
Build dependencies = docker & docker-compose
Run build `sh build.sh`  


