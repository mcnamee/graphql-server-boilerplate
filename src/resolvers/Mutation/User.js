const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Adds JWT token to `Sign Up` mutation
 */
module.exports.signup = async (parent, args, context) => {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.prisma.createUser({ ...args, password });

  return {
    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    user,
  };
};

/**
 * Handles `Login` mutation
 */
module.exports.login = async (parent, { email, password }, context) => {
  const user = await context.prisma.user({ email });
  if (!user) throw new Error(`No user found for email: ${email}`);

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) throw new Error('Invalid password');

  return {
    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    user,
  };
};
