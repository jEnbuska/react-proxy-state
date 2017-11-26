import uuid from 'uuid/v4';

export const initialState = {
    a: {id: 'a', description: 'Do homework', done: false},
};

export function addTodo(description) {
    return function ({todos}) {
        const id = uuid();
        todos.assign({[id]: {id, description, done: false}});
    };
}

export function toggleTodo(id) {
    return function ({todos}) {
        todos[id].done.toggle();
    };
}

export function removeTodo(id) {
    return function ({todos}) {
        todos.remove(id);
    };
}