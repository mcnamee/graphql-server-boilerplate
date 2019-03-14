const jwt = require('jsonwebtoken');

/**
 * Throw an Auth Error
 */
class AuthError extends Error {
  constructor() {
    super('Not authorized');
  }
}

/**
 * Get the ID (of the current user) from the "Authorization: Bearer..." header
 * @param {*} context
 */
function getUserId(context) {
  let Authorization = null;

  // Lambda Auth header
  if (context && context.event && context.event.headers && context.event.headers.Authorization) {
    Authorization = context.event.headers.Authorization; // eslint-disable-line
  }

  // Local server Auth Header
  if (context && context.request && context.request.get('Authorization')) {
    Authorization = context.request.get('Authorization');
  }

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    return userId;
  }

  throw new AuthError();
}

module.exports = {
  getUserId,
  AuthError,
};
