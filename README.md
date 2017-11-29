Experimental library for managing React app state using Proxys

Works only on browsers that support Javascript Proxys

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

const Provider = createProvider(initialState, {...todoEventHandlers});

const Root = () => (
    <Provider>
        <TodosApp/>
    </Provider>
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