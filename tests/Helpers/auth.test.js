const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { AuthError, getUserId } = require('../../src/Helpers/auth');

describe('Helpers/auth', () => {
  beforeEach(() => { jest.resetModules(); dotenv.config(); });

  /**
   * getUserId()
   */
  test('`getUserId()` should provide token\'s User ID (Lambda)', () => {
    const userId = '123';
    const Authorization = `Bearer ${jwt.sign({ userId }, process.env.APP_SECRET, { expiresIn: 86400 })}`;
    const context = { event: { headers: { Authorization } } };

    const userIdFromToken = getUserId(context);
    expect(userIdFromToken).toEqual(userId);
  });

  test('`getUserId()` should provide token\'s User ID (NodeJS Server)', () => {
    const userId = '123';
    const Authorization = `Bearer ${jwt.sign({ userId }, process.env.APP_SECRET, { expiresIn: 86400 })}`;
    const context = { request: { get: () => Authorization } };

    const userIdFromToken = getUserId(context);
    expect(userIdFromToken).toEqual(userId);
  });

  test('`getUserId()` should throw an error when no Auth header', () => {
    expect(() => getUserId(null)).toThrow();
  });

  /**
   * AuthError()
   */
  test('`new AuthError()` should provide an error', () => {
    const authErr = new AuthError();
    expect(authErr).toEqual(new Error('Not authorized'));
  });
});
