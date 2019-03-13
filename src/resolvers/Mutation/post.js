const { getUserId } = require('../../Helpers/auth');

/**
 * Handles the `Create Draft` mutation
 */
module.exports.createDraft = async (parent, { title, content }, context) => {
  const userId = getUserId(context);

  return context.prisma.createPost({
    title,
    content,
    author: { connect: { id: userId } },
  });
};

/**
 * Handles the `Publish Post` mutation
 */
module.exports.publish = async (parent, { id }, context) => {
  const userId = getUserId(context);
  const postExists = await context.prisma.$exists.post({
    id,
    author: { id: userId },
  });
  if (!postExists) throw new Error('Post not found or you\'re not the author');

  return context.prisma.updatePost({
    where: { id },
    data: { published: true },
  });
};

/**
 * Handles the `Delete Post` mutation
 */
module.exports.deletePost = async (parent, { id }, context) => {
  const userId = getUserId(context);
  const postExists = await context.prisma.$exists.post({
    id,
    author: { id: userId },
  });
  if (!postExists) {
    throw new Error('Post not found or you\'re not the author');
  }

  return context.prisma.deletePost({ id });
};
