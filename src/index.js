const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('../prisma/generated/prisma-client');

const Query = require('./Resolvers/Query');
const Mutation = require('./Resolvers/Mutation');
const Subscription = require('./Resolvers/Subscription');
const Models = require('./Resolvers/Models');

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers: {
    Query, Mutation, Subscription, ...Models,
  },
  context: request => ({
    ...request,
    prisma,
  }),
});

server.start(() => console.log('Server is running on http://localhost:4000'));
