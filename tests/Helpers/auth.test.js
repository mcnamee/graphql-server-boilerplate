/* global describe test expect jest beforeEach */
const jwt = require('jsonwebtoken');
const { AuthError, getUserId } = require('../../src/Helpers/auth');

describe('Helpers/auth', () => {
  beforeEach(() => { jest.resetModules(); process.env.APP_SECRET = '123Abc123'; });

  /**
   * getUserId()
   */
  test('getUserId() should provide token\'s User ID', () => {
    const userId = '123';
    const Authorization = `Bearer ${jwt.sign({ userId }, process.env.APP_SECRET, { expiresIn: 86400 })}`;
    const context = { event: { headers: { Authorization } } };

    const userIdFromToken = getUserId(context);
    expect(userIdFromToken).toEqual(userId);
  });

  /**
   * AuthError()
   */
  test('AuthError should provide an error', () => {
    const authErr = new AuthError();
    expect(authErr).toEqual(new Error('Not authorized'));
  });
});
