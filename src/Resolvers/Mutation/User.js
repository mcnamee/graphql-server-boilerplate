const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserId } = require('../../Helpers/auth');

/**
 * `Create` a User
 */
module.exports.signup = async (parent, { name, email, password }, context) => {
  // Create a hashed password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user and generate a token
  const user = await context.prisma.createUser({ name, email, password: hashedPassword });
  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

  return { token, user };
};

/**
 * `Update` a User
 */
module.exports.updateUser = async (parent, { name, email, password }, context) => {
  const id = getUserId(context);

  // Ensure user exists
  const userExists = await context.prisma.$exists.user({ id });
  if (!userExists) throw new Error('You\'re not authorized to update this user');

  // Create a hashed password
  const hashedPassword = (password) ? await bcrypt.hash(password, 10) : null;

  // Only update the (whitelisted) data that was passed through
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (hashedPassword) data.password = hashedPassword;

  return context.prisma.updateUser({ where: { id }, data });
};

/**
 * Handles `Login` mutation
 */
module.exports.login = async (parent, { email, password }, context) => {
  // Ensure username exists
  const user = await context.prisma.user({ email });
  if (!user) throw new Error(`No user found for email: ${email}`);

  // Ensure password is correct
  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) throw new Error('Invalid password');

  return {
    token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    user,
  };
};
