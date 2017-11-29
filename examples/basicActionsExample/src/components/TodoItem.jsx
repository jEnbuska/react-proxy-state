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
