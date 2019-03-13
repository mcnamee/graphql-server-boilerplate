const { getUserId } = require('../../Helpers/auth');

/**
 * `Create` a (Draft) Post
 */
module.exports.createDraft = async (parent, { title, content }, context) => {
  const userId = getUserId(context);

  return context.prisma.createPost({ title, content, author: { connect: { id: userId } } });
};

/**
 * `Update` a Post to mark it as published
 */
module.exports.publish = async (parent, { id }, context) => {
  const userId = getUserId(context);

  const postExists = await context.prisma.$exists.post({ id, author: { id: userId } });
  if (!postExists) throw new Error('Post not found or you\'re not the author');

  return context.prisma.updatePost({ where: { id }, data: { published: true } });
};

/**
 * `Delete` a Post
 */
module.exports.deletePost = async (parent, { id }, context) => {
  const userId = getUserId(context);

  // Only allow a user to delete a post they own
  const postExists = await context.prisma.$exists.post({ id, author: { id: userId } });
  if (!postExists) throw new Error('Post not found or you\'re not the author');

  return context.prisma.deletePost({ id });
};
