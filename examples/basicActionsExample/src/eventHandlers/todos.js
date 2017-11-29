import uuid from 'uuid/v4';

export const initialState = {
    a: {id: 'a', description: 'Do homework', done: false},
};

export const addTodo = (description) => ({todos}) => {
    const id = uuid();
    todos.assign({[id]: {id, description, done: false}});
};
export const toggleTodo = (id) => ({todos}) => todos[id].done.toggle();

export const removeTodo = (id) => ({todos}) => todos.remove(id);

export const removeAllTodos = () => ({todos}) => todos.clear({});