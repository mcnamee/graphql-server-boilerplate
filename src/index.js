const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('../prisma/generated/prisma-client');
const resolvers = require('./Resolvers');

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: request => ({
    ...request,
    prisma,
  }),
});

server.start(() => console.log('Server is running on http://localhost:4000'));
