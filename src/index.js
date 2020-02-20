/**
 * Starts the GraphQL server (including playground)
 */
const { GraphQLServer, GraphQLServerLambda } = require('graphql-yoga');
const { prisma } = require('../prisma/generated/prisma-client');

// Resolvers
const Query = require('./Resolvers/Query');
const Mutation = require('./Resolvers/Mutation');
const Subscription = require('./Resolvers/Subscription');
const Models = require('./Resolvers/Models');

// Setup server config
const graphQLServerConfig = {
  typeDefs: 'src/schema.graphql',
  resolvers: {
    Query, Mutation, Subscription, ...Models,
  },
  context: (request) => ({ ...request, prisma }),
};

// Export the serverless functions when run on the likes of AWS Lambda
if (process.env.APP_SERVERLESS === 'true') {
  const lambda = new GraphQLServerLambda(graphQLServerConfig);

  exports.server = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line
    return lambda.graphqlHandler(event, context, callback);
  };

  exports.playground = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; // eslint-disable-line
    return lambda.playgroundHandler(event, context, callback);
  };

// Otherwise, Start the GraphQL Server
} else {
  const server = new GraphQLServer(graphQLServerConfig);
  server.start(() => console.log('Server is running on http://localhost:4000'));
}
