const dotenv = require('dotenv');
const { signup, updateUser, login } = require('../../../src/Resolvers/Mutation/User');

jest.mock('../../../src/Helpers/auth');

// Mock data
const mockPostData = {
  id: 'cjtav3ppl000h08888mxj6dfn',
  name: 'Zeus',
  email: 'zeus@examples18.com',
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
    expect(res.name).toBeUndefined();
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
});
