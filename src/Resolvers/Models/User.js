module.exports.User = {
  /**
   * Fill the `Posts array of IDs` with the respective Posts
   */
  posts: ({ id }, args, context) => context.prisma.user({ id }).posts(),
};
