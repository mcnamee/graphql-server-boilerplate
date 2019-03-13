const Subscription = {
  feedSubscription: {
    subscribe: async (parent, args, context) => context.prisma.$subscribe
      .post({
        mutation_in: ['CREATED', 'UPDATED'],
      })
      .node(),
    resolve: payload => payload,
  },
};

module.exports = { Subscription };
