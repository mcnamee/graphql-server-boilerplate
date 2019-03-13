const User = {
  posts: ({ id }, args, context) => context.prisma.user({ id }).posts(),
};

module.exports = {
  User,
};
