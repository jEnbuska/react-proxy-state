import uuid from 'uuid/v4';

export const initialState = {
    a: {id: 'a', description: 'Do homework', done: false},
};

//demonstrate 'delay'
export const addTodo = (description) => async ({todos}, {delay}) => {
    const id = uuid();
    await delay(500); // request of some sort
    todos.assign({[id]: {id, description, done: false}});
};

//demonstrate 'next'
export const toggleTodo = (id) => ({todos}, {next, delay}) => {
    const done = todos[id].done.toggle();
    if(done.state){ // remove todo if done
        delay(1000).then(() => next(removeTodo(id)))
    }
}

// demonstrate 'custom extra params'
export const removeTodo = (id) => ({todos}, {loglog}) => {
    todos.remove(id)
    loglog();
};

export const removeAllTodos = () => ({todos}) => todos.clear({});