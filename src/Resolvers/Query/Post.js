const { getUserId } = require('../../Helpers/auth');

/**
 * `Read` a single post
 */
module.exports.post = (parent, { id }, context) => (
  context.prisma.post({ id })
);

/**
 * `List` all published Posts
 */
module.exports.listPosts = (parent, args, context) => (
  context.prisma.posts({ where: { published: true } })
);

/**
 * `List` all un-published Posts
 */
module.exports.listDraftPosts = (parent, args, context) => {
  const id = getUserId(context);
  const where = { published: false, author: { id } };
  return context.prisma.posts({ where });
};
