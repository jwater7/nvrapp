Temporarily installed express-generator and ran express to create skeleton:
~~~~
npm install express-generator
#PATH=$(npm bin):$PATH express --git --no-view --force
node_modules/.bin/express --git --no-view --force
npm init #append more details
npm install
npm install --save express-graphql
npm install --save graphql
~~~~

Run with (and add to package.json as debug script)
~~~~
IMAGE_PATH=./debug-data/pics AUTH_PATH=./debug-data/data/auth PRIVATE_KEY=nonvolatile THUMB_PATH=./debug-data/data/thumbs PORT=8000 DEBUG=express,nvrapp:* npm start
~~~~

Example graphql code for app.js:
~~~~
const expressGraphQL = require('express-graphql');
//TODO ES6 not working for node 8
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

app.use('/api/v1/graphql', expressGraphQL({
  schema: myGraphQLSchema,
  graphiql: true,
}));
~~~~

Then navigate to GraphiQL interface at http://localhost:8000/api/v1/graphql
paste and run:
~~~~
{
  hello
}
~~~~

Or in docker run example:
~~~~
docker run -it --rm -p 3000:3000 jwater7/nvrapp
~~~~

TODO: 
* Remove public/ and routes/ directory

Useful links:
* https://github.com/graphql/express-graphql
* https://github.com/graphql/graphql-js
* https://github.com/passport/express-4.x-local-example/blob/master/package.json

