const { GraphQLServer, GraphQLServerLambda } = require('graphql-yoga');
const { prisma } = require('../prisma/generated/prisma-client');

const Query = require('./Resolvers/Query');
const Mutation = require('./Resolvers/Mutation');
const Subscription = require('./Resolvers/Subscription');
const Models = require('./Resolvers/Models');

const graphQLServerConfig = {
  typeDefs: 'src/schema.graphql',
  resolvers: {
    Query, Mutation, Subscription, ...Models,
  },
  context: request => ({
    ...request,
    prisma,
  }),
};

// Start a server when testing locally
if (process.env.APP_ENV === 'local') {
  const server = new GraphQLServer(graphQLServerConfig);
  server.start(() => console.log('Server is running on http://localhost:4000'));

// Export for Lambda
} else {
  // For Lambda in Prod
  const lambda = new GraphQLServerLambda(graphQLServerConfig);

  exports.server = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line
    return lambda.graphqlHandler(event, context, callback);
  };

  exports.playground = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line
    return lambda.playgroundHandler(event, context, callback);
  };
}
