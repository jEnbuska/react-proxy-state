const axios = require('axios');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean,
} = require('graphql');

const string = { type: GraphQLString, };
const int = { type: GraphQLInt, };
const bool = { type: GraphQLBoolean, };
const nonNull = (val) => ({ type: new GraphQLNonNull(val.type), });
const list = val => ({ type: new GraphQLList(val.type), });

// Customer Type
const CustomerType = new GraphQLObjectType({
  name: 'Customer',
  fields: () => ({
    id: string,
    name: string,
    email: string,
    age: int,
  }),
});
const TodoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: string,
    userId: string,
    description: string,
    done: bool,
  }),
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    age: int,
    single: bool,
    todos: {
      type: new GraphQLList(TodoType),
    },
  }),
});

// Root Query
const RootQuery= new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {
        id: string,
      },
      async resolve(_, { id, }) {
        const { data, } = await axios.get('http:((localhost:3000/user/'+id);
        return data;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      args: {},
      async resolve() {
        console.log('get users');
        const { data: users = [], } = await axios.get('http://localhost:3000/users');
        console.log('get todos');
        let { data: todos = [], } = await axios.get('http://localhost:3000/todos');
        console.log('reduce');
        todos = todos.reduce((acc, todo) => {
          const { userId, } = todo;
          if (!acc[userId]) {
            acc[userId] = [];
          }
          acc[userId].push(todo);
          return acc;
        }, {});
        console.log('forEach');
        users.forEach(user => (user.todos = todos[user.id] || []));
        return users;
      },
    },
    todo: {
      type: TodoType,
      args: {
        id: string,
      },
      async resolve(_, { id, }) {
        const { data, } = await axios.get('http://localhost:3000/customer/'+id);
        return data;
      },
    },
    todos: {
      type: new GraphQLList(TodoType),
      args: {
        userId: string,
      },
      async resolve(_, { userId, }) {
        const { data, } = await axios.get('http://localhost:3000/todos?userId='+userId);
        return data;
      },
    },
  },
});

// Mutations
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        id: nonNull(string),
        firstName: nonNull(string),
        lastName: nonNull(string),
        age: nonNull(int),
        email: nonNull(string),
        single: bool,
      },
      async resolve(_, args) {
        const { data, } = axios.post('http://localhost:3000/users', args);
        return data;
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString), },
      },
      async resolve(_, { id, }) {
        const { data, } = await axios.delete('http://localhost:3000/users/'+id);
        return data;
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: nonNull(string),
        firstName: nonNull(string),
        lastName: nonNull(string),
        age: nonNull(int),
        email: nonNull(string),
        single: bool,
      },
      async resolve(_, args) {
        const { data, } = await axios.patch('http://localhost:3000/users/'+args.id, args);
        return data;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation,
});