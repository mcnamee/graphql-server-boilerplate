const Post = {
  author: ({ id }, args, context) => context.prisma.post({ id }).author(),
};

module.exports = {
  Post,
};
