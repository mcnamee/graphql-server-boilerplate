const { getUserId } = require('../../Helpers/auth');
/**
 * Adds a `Me` Query, showing the current user, based on the "Authorization" Header
 */
module.exports.me = (parent, args, context) => {
  const id = getUserId(context);
  return context.prisma.user({ id });
};
