const Koa = require('koa');
const schema = require('./data/schema');
// eslint-disable-next-line camelcase
const graphQL_HTTP = require('koa-graphql');

const app = new Koa();

app.timeout = 100
app.use(graphQL_HTTP({
  schema,
  graphiql: true,
}));

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => console.log('listening to '+PORT));