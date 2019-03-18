const dotenv = require('dotenv');
const { createDraft, publish, deletePost } = require('../../../src/Resolvers/Query/Post');

jest.mock('../../../src/Helpers/auth');

describe('Resolvers/Mutation/Post', () => {
  beforeEach(() => { jest.resetModules(); dotenv.config(); });

  /**
   * createDraft(), publish(), deletePost()
   */
  test('All Post mutations should throw when not auth\'d', () => {
    expect(() => createDraft()).toThrow();
    expect(() => publish()).toThrow();
    expect(() => deletePost()).toThrow();
  });
});
