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
