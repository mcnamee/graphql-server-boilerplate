const dotenv = require('dotenv');
const {
  signup, updateUser, login, forgotPassword, resetPassword, verifyEmail,
} = require('../../../src/Resolvers/Mutation/User');

jest.mock('../../../src/Helpers/auth');
jest.mock('../../../src/Helpers/mail');

// Mock data
const mockPostData = {
  id: 'cjtav3ppl000h08888mxj6dfn',
  firstName: 'Zeus',
  lastName: 'Zellot',
  email: 'zeus@examples18.com',
  emailVerified: true,
  password: '$2a$10$Q/nZIwakkXbXLgQORmMqGO7VyEqxR1gcqL4pKQYusEyFz043pNgOy', // secret42
  posts: [
    {
      id: 'cjtav4dmh000v0888a6wi16nc',
      title: 'New Draft Post',
      published: false,
    },
  ],
};

// Mock Prisma responses
const context = {
  prisma: {
    createUser: jest.fn(() => mockPostData),
  },
};

describe('Resolvers/Mutation/User', () => {
  beforeEach(() => { jest.resetModules(); dotenv.config(); });

  /**
   * signup()
   */
  test('`signup()` should provide user and token', async () => {
    const res = await signup(null, { ...mockPostData, password: '123Abc' }, context);

    expect(res).toBeDefined();
    expect(res.token).toBeDefined();
    expect(res.user.email).toEqual(mockPostData.email);
  });

  /**
   * updateUser()
   */
  test('`updateUser()` should throw when user doesn\'t exist', async () => {
    // Mock a DB lookup for user as 'doesn't exist'
    context.prisma.$exists = { user: jest.fn(() => null) };

    await expect(updateUser(null, mockPostData, context)).rejects.toThrow();
  });

  test('`updateUser()` should only update the fields provided', async () => {
    const dataToUpdate = { email: 'jane@doe.com' };

    context.prisma.$exists = { user: jest.fn(() => mockPostData.id) };
    context.prisma.updateUser = jest.fn(fcInput => fcInput.data);

    const res = await updateUser(null, dataToUpdate, context);

    expect(res).toBeDefined();
    expect(res.email).toBeDefined();
    expect(res.firstName).toBeUndefined();
    expect(res.lastName).toBeUndefined();
    expect(res.password).toBeUndefined();
  });

  /**
   * login()
   */
  test('`login()` should throw when user email/password doesn\'t match', async () => {
    // Password check - should throw when password is incorrect
    context.prisma.user = jest.fn(() => mockPostData);

    await expect(
      login(null, { email: 'zeus@examples18.com', password: 'wrong' }, context),
    ).rejects.toThrow();

    // Email check - should throw when DB doesn't return user
    context.prisma.user = jest.fn(() => null);

    await expect(
      login(null, { email: 'zeus@examples20.com', password: 'secret42' }, context),
    ).rejects.toThrow();
  });

  test('`login()` should provide a token and user data', async () => {
    context.prisma.user = jest.fn(() => mockPostData);
    const res = await login(null, { email: mockPostData.email, password: 'secret42' }, context);

    expect(res).toBeDefined();
    expect(res.token).toBeDefined();
    expect(res.user.email).toEqual(mockPostData.email);
  });

  /**
   * forgotPassword()
   */
  test('`forgotPassword()` should throw when email can\'t be found', async () => {
    context.prisma.user = jest.fn(() => null);

    await expect(forgotPassword(null, { email: 'zeus@examples18.com' }, context))
      .rejects.toThrowError(/not authorized/);
  });

  /**
   * resetPassword()
   */
  test('`resetPassword()` should throw on token error', async () => {
    // mockPostData.resetToken = 'abc';
    // mockPostData.resetTokenExpires = Date.now() - 3600000; // Expired an hour ago
    context.prisma.users = jest.fn(() => []);

    await expect(resetPassword(null, { resetToken: '123', password: 'abc' }, context))
      .rejects.toThrowError(/expired/);
  });

  /**
   * verifyEmail()
   */
  test('`verifyEmail()` should throw on token error', async () => {
    context.prisma.users = jest.fn(() => []);

    await expect(verifyEmail(null, { emailVerifiedToken: '123' }, context))
      .rejects.toThrowError(/Token doesn/);
  });

  test('`verifyEmail()` should throw when already verified', async () => {
    context.prisma.users = jest.fn(() => [mockPostData]);

    await expect(verifyEmail(null, { emailVerifiedToken: '123' }, context))
      .rejects.toThrowError(/already been verified/);
  });
});
