Experimental library for managing React app state using Proxys

Works only on browsers that support Javascript Proxys

Table of contents
=================
* [Getting stated](#getting-started)
  * [Install](#install)  
  * [Examples](#examples)
    * [eventHandlers](#eventhandler-functions)
    * [createProvider](#createprovider)
    * [mapContextToProps](#mapcontexttoprops)
* [Api description](#api-description)
  * [Context State](#context-state)
    * [Subscribe](#subscribe)
    * [Get State](#get-state)
  * [Map context state to props](#map-context-state-to-props)
  * [Context eventhandlers](#context-eventhandlers)
  * [Eventhandler proxy Nodes](#eventhandler-proxy-nodes)
    * [State variable](#state-variable)
    * [Updating state from eventhandlers](#updating-state)
      * [clear](#clear)
      * [assign](#assign)
      * [remove](#remove)     
      * [toggle](#toggle)
* [More](#more)
  * [Application flow](#application-flow)
  * [Caveats](#caveats)
  
# Getting Started

## Install

```npm install react-proxy-state``` or ```yarn add react-proxy-state```

## Examples

### eventHandler functions
Four functions: (***clear***, ***assign***, ***remove***, ***toggle***) + ***state***
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

All eventHandlers are accessable from component ***context***
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

# Api Description

## Context State
Context state is owned and served by ***ContextProvider*** Component, that lives in the component hierarchy root.
ContextProvider Component is created by ***createProvider*** function, that takes the initial state as 1st parameter.
```
import {createProvider} from 'react-proxy-state'
const ContextProvider = createProvider(initialState);

const Root = () => (
    <ContextProvider>
        <App/>
    </ContextProvider>
);
```
All <sub><sup>implicit and explicit</sup></sub> children of ContextProvider can subscribe to state changes throught context api.

ContextProvider offers *subscribe* and *getState* context functions, to all of its contextual child components.

### Subscribe
`subscribe` takes a callback function as argument, and it return a function for cancelling the subscription. 
Callback function provided as the argument will be called everytime context state changes.

### Get State
`getState` returns the current context state

***Though context state can be manually be subscribed from context, Components should not access it directly***


## Map Context State To Props

Components using context state, should be defined by using ***mapContextToProps***.
mapContextToProps helps creating a higher-order component <sub>Connector</sub> that wraps the *actual component*.
mapContextToProps *subscribes* the context state, on behave of the *actual component*. 
Every time the context state changes, *Connector* passes the context state as properties to the *actual component*. 

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
const createConnected = mapContextToProps(selector); 
export default createConnected(Todo);
```
mapContextToProps is a ***higher order function*** that takes a state **selector** as parameter. 
*mapContextToProps returns a ***createConnected*** function that takes the *actual component* as parameter.

***selector*** is a function that takes contexts state and component own properties as parameters.

Everytime* Components properties or context state changes, this selector functions is re-run, and what ever it returns, gets passed as property by *Connector* to the component passed to ***createConnected*** 

<sub>(if the output changes compared to the previous output)*.</sub>


## Context eventhandlers

Event handlers are functions that are responsible for updating the context state.
These function must be passed to ***createProvider*** as second argument durin initialization.
ContextProvider server these eventHandlers to all of it's children, and components can access these eventHandlers throught context api.
```
const doSomething = () => proxy => {...};
const doSomethingElse = (parameter) => proxy => {...}
const eventHandlers = {doSomething, doSomethingElse}
const ContextProvider = createProvider(initialState, eventHandlers);
```
Eventhandlers must be defined as ***higher order functions***.
When ever a Component invokes these eventHandlers, it's result is invoked with a ***context state proxy as 1st argument***.

ContextProviders simply transforms eventHandlers, into a reqular function, before they are server to components:
```
const before = (...params) => proxy => {...};
const after = (...params) => before(...param)(proxy);
```

For a component to be able to access eventhandlers server by ContextProvider, the component has to announce which context variables it is going to be using, by defining the components ***contextTypes***.

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

## Eventhandler proxy Nodes
Every eventhanlers output gets a context state [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) as the first parameter.
```
const myEventHandler () => proxy => { ... };
```
This Proxy is a root node in a ***shadow datastructure of the actual state***.
This node acts as an ***interface for making changes*** to the state, while keeping the states datastructure ***immutable***.
A single location in the shadow state is called a ***node***.

The benefit of updating the state by using eventHandler nodes, is that all the update actions are mirrored back to the actual state, and they are applied by using ***pathcopying***.
As a result, the context state stais allways ***immutable*** without any hassle and boilerplate code.

### State variable
Every node represents a particular location of the state. That state can be read by accessing nodes ***state*** variable
```
const logTodoStatus = (which) => (proxy) => {
    const status = proxy.todos[which].done.state;
    console.log(status); // --> true or false
}
```
***state*** variable is a getter, so when accessed it always gets re-evaluated.

You should never be directly to changed or mutate nodes state property.


### Updating state

There is four methods that are recommended to be used when ever the underlying state should be updated.

#### clear
Clear acts on behave of the assigment operation.
<pre>
const setUserName = (userId, name) => {
  <sub><b>objective</b> state.users[userId].name = name</sub>
  return function <b>implementation</b>({users}){ 
    users[userId].name.clear(name);    
  }
  <sub><b>result</b> { ...state, users: {...state.users, [userId]: {...state.users[userId], name}} }</sub>
}
</pre>
#### assign
Use assign when ever you would use Object.assign
<pre>
const updateUser = (userId, update) => {
   <sub><b>objective</b> Object.assign(state.users[userId], update)</sub>
   return function <b>implementation</b>({users}){
     users[userId].assign(update);
   }
   <sub><b>result</b> { ...state, users: {...state.users, [userId]: {...state.users[userId], ...update}} }</sub>
}
</pre>

#### remove
Use remove when ever you would delete values
<pre>
const removeUsers = (userIds) => {
  <sub><b>objektive</b> usersIds.forEach(id => delete state.users[id])</sub>
  function <b>implementation</b>({users}){
    users.remove(...userIds);
  }
  <sub><b>result</b> 
     { ...state, users: Object.entries(state.users)
       .filter(([id]) => userIds.every(next => id!==next)
       .reduce((users, [id, user]) => Object.assign(users, {[id]: user}), {}) }</sub>  
}
</pre>

#### Toggle
Toggle simply negates the current substate
<pre>
const toggleUserActive = (userId) => {
   <sub><b>objektive</b> state.users[userId].active = !state.users[userId].active</sub>
   function <b>implementation</b>({users}){
      users[userId].active.toggle();
   }
   <sub><b>result</b> { ...state, users: {...state.users, [userId]: {...state.users[userId], active: !state.users[userId].active}} }</sub>
}
</pre>


# More

## Application flow
![react-proxy-state flow](https://user-images.githubusercontent.com/11061511/33515232-ef719c38-d768-11e7-927e-fcdbfaeda470.png)

## Caveats
1. Eventhandler nodes are not directly ***comparable***
```
const eHandler = () => proxy => {
   proxy.assign({a:1, b:1});
   proxy.a === proxy.b; // false
}
```
2. ***Arrays*** might behave ***unpredictably*** and array update ***performance*** might be poor
<pre>
const remover = (index) => proxy => {
   const {userList} = proxy;
   const second = userList[1];
   userList.remove(0);
   second === userList[0]; // true
}
</pre>
3. Avoid performing any ***iteration*** on nodes
<pre>
const {values} = Object;
const removeBosses = (index) => ({employees}) => {
   //poor performance
   const ids = values(users).filter(e => e.state.salary > 10**5).map(e => e.id); 
   users.remove(...ids);
  ...
  //better
  const ids = values(employees.state).filter(e => e.salary > 10**5).map(e => e.id);
  users.remove(...ids)  
}
</pre>

4. Keep context state as plain and ***normalized*** as possible.
  - Use only ***strings*** or numbers as ***keys***
  - Just ***plain objects***. No Class instances, or otherwise modified objects
  - ***Serializable datastructures***. No circular references
  - ***Avoid using arrays***, when ever the content of that array might change during the applications lifetime.

5. ***undefined*** values in state are considered as non-existing. 
To avoid errors juse *assign* instead of *clear* when ever possible.
const setToUndefined = () => ({something}) => {
  something.assign({a: undefined, b: null});
  something.b.clear(undefined);  
  something.b // undefined
  something.a.clear(null); // throws Error
  
}
</pre>

