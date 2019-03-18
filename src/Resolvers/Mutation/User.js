const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserId } = require('../../Helpers/auth');
const { transport, htmlEmail } = require('../../Helpers/mail');

/**
 * `Create` a User
 */
module.exports.signup = async (parent, {
  firstName, lastName, email, password,
}, context) => {
  // Create a hashed password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a email verification token
  let emailVerifiedToken = Math.random().toString(36).substring(2, 15);
  emailVerifiedToken += Math.random().toString(36).substring(2, 15);

  // Send an email (in the background) containing the verification token
  try {
    transport.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Please verify your email address',
      html: htmlEmail(`This is your verification token:
      \n\n
      ${emailVerifiedToken}`),
    });
  } catch (err) { console.log(err); }

  // Create the user and generate a token
  const user = await context.prisma.createUser({
    firstName, lastName, email, password: hashedPassword, emailVerifiedToken,
  });
  const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

  return { token, user };
};

/**
 * `Update` a User
 */
module.exports.updateUser = async (parent, {
  firstName, lastName, email, password,
}, context) => {
  const id = getUserId(context);

  // Ensure user exists
  const userExists = await context.prisma.$exists.user({ id });
  if (!userExists) throw new Error('You\'re not authorized to update this user');

  // Create a hashed password
  const hashedPassword = (password) ? await bcrypt.hash(password, 10) : null;

  // Only update the (whitelisted) data that was passed through
  const data = {};
  if (firstName) data.firstName = firstName;
  if (lastName) data.lastName = lastName;
  if (email) data.email = email;
  if (hashedPassword) data.password = hashedPassword;

  return context.prisma.updateUser({ where: { id }, data });
};

/**
 * Handles `Login` mutation
 */
module.exports.login = async (parent, { email, password }, context) => {
  // Ensure user exists
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

/**
 * Handles `Forgot Password` mutation
 */
module.exports.forgotPassword = async (parent, { email }, context) => {
  // Ensure user exists
  const user = await context.prisma.user({ email });
  if (!user) throw new Error('You\'re not authorized to reset this password');

  // Create a 'reset token' + expiry time and add to the DB
  let resetToken = Math.random().toString(36).substring(2, 15);
  resetToken += Math.random().toString(36).substring(2, 15);
  const resetTokenExpires = Date.now() + 3600000; // 1 hour from now

  const data = { resetToken, resetTokenExpires };
  await context.prisma.updateUser({ where: { id: user.id }, data });

  // Send an email (in the background) containing the token
  try {
    transport.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Your Password Reset Token',
      html: htmlEmail(`This is your password reset token!
      \n\n
      ${resetToken}`),
    });
  } catch (err) { console.log(err); }

  // Return the a success
  return { message: 'Email sent' };
};

/**
 * Handles `Reset Password` mutation
 */
module.exports.resetPassword = async (parent, { resetToken, password }, context) => {
  // Ensure `resetToken` exists against user
  // + ensure `resetTokenExpires` hasn't passed
  const [user] = await context.prisma.users({
    where: {
      resetToken,
      resetTokenExpires_gte: Date.now() - 3600000,
    },
  });
  if (!user) throw new Error('Token doesn\'t exist or has expired');

  // Create a hashed password and update DB
  const hashedPassword = (password) ? await bcrypt.hash(password, 10) : null;

  const data = { password: hashedPassword, resetToken: null, resetTokenExpires: null };
  const updatedUser = await context.prisma.updateUser({ where: { id: user.id }, data });

  // Return token and user data
  return {
    token: jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET),
    user: updatedUser,
  };
};

/**
 * Handles `Email Verification` mutation
 */
module.exports.verifyEmail = async (parent, { emailVerifiedToken }, context) => {
  // Ensure `resetToken` exists against user
  const [user] = await context.prisma.users({ where: { emailVerifiedToken } });
  if (!user) throw new Error('Token doesn\'t exist');

  // User already verified, show a suitable message
  if (user && user.emailVerified) throw new Error('This email has already been verified');

  const data = { emailVerified: true };
  const updatedUser = await context.prisma.updateUser({ where: { id: user.id }, data });

  // Return token and user data
  return { ...updatedUser };
};
