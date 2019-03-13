const { getUserId } = require('../../Helpers/auth');

/**
 * Adds a `Feed` Query, only showing published Posts
 */
module.exports.feed = (parent, args, context) => (
  context.prisma.posts({ where: { published: true } })
);

/**
 * Adds a `Drafts` Query, only showing un-published Posts
 */
module.exports.drafts = (parent, args, context) => {
  const id = getUserId(context);
  const where = { published: false, author: { id } };
  return context.prisma.posts({ where });
};

/**
 * Adds a `Post` Query, only showing the Post of current ID
 */
module.exports.post = (parent, { id }, context) => (
  context.prisma.post({ id })
);
