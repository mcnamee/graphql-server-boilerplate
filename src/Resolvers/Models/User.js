module.exports.User = {
  /**
   * `Combine firstname & lastname` to create a name field
   */
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,

  /**
   * Fill the `Posts array of IDs` with the respective Posts
   */
  posts: ({ id }, args, context) => context.prisma.user({ id }).posts(),
};
