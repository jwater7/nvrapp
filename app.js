const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
const expressGraphQL = require('express-graphql');
//import {
//  GraphQLSchema,
//  GraphQLObjectType,
//  GraphQLString,
//} from 'graphql';
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');

const app = express();

const myGraphQLSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
	},
      },
    },
  }),
});

app.use('/api/v1/', expressGraphQL({
  schema: myGraphQLSchema,
  graphiql: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

// Any other paths, assume they are the frontend
app.use(express.static(path.join(__dirname, 'frontend/build')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'frontend/build/index.html')) });

module.exports = app;

