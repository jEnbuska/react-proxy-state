import uuid from 'uuid/v4';

export function addTodo(description) {
    return function ({todos}) {
        const id = uuid();
        todos.assign({[id]: {id, description, done: false}});
    };
}

export function toggleTodo(id) {
    return function ({todos: {[id]: todo}}) {
        const {state} = todo;
        todo.done = !state.done;
    };
}