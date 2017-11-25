import uuid from 'uuid/v4';

export function addUser() {
  return function ({ users, selections, todosByUser, }) {
    const id = uuid();
    const { single, ...rest } = selections.user.state;
    const { [id]: newUser, }= users.content.assign({ [id]: { id, ...rest, single: !!single, pending: true, }, });
    selections.user.assign({ pending: true, });
    return new Promise(res => {
      setTimeout(() => {
        todosByUser.content.assign({ [id]: {}, });
        selections.user.clearState({});
        newUser.assign({ pending: false, });
        localStorage.setItem('todosContent', JSON.stringify(todosByUser.content.state));
        localStorage.setItem('users', JSON.stringify(users.content.state));
        res();
      }, 800);
    });
  };
}

export function modifySelectedUser(obj) {
  return function ({ selections: { user, }, }) {
    user.assign(obj);
  };
}

export function saveUserChanges() {
  return function ({ selections: { user: selectedUser, }, users, }) {
    const { state, } = selectedUser.assign({ pending: true, });
    const user = users.content[state.id];
    user.assign(state);
    return new Promise(res => setTimeout(() => {
      user.remove('pending');
      selectedUser.remove('pending');
      localStorage.setItem('users', JSON.stringify(users.content.state));
      res();
    }, 800
    ));
  };
}

export function clearUserModification() {
  return function ({ selections: { user, }, }) {
    user.clearState({});
  };
}

export function removeUser(id) {
  return function ({ users, }) {
    users.content[id].assign({ pending: true, });
    return new Promise(res => {
      users.content.remove(id);
      localStorage.setItem('users', JSON.stringify(users.content.state));
      res();
    }, 800);
  };
}

export function selectUser(id) {
  return function ({ selections, users: { content, }, }) {
    selections.assign({ user: content[id].state, });
  };
}

export function fetchUsers() {
  return async function (store) {
    const { users, todosByUser, } = store;
    users.status.assign({ pending: false, });
    todosByUser.status.assign({ pending: true, });
    await new Promise(res => setTimeout(res, 800));
    let userData = localStorage.getItem('users');
    userData = userData ? JSON.parse(userData) : {};
    let todoData = localStorage.getItem('todosContent');
    todoData = todoData ? JSON.parse(todoData) : {};
    users.assign({ content: userData, status: { pending: false, }, });
    todosByUser.assign({ content: todoData, status: { pending: false, }, });
  };
}