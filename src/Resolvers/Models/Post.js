module.exports.Post = {
  /**
   * Fill the `Author ID` with details on the respective User
   */
  author: ({ id }, args, context) => context.prisma.post({ id }).author(),
};
