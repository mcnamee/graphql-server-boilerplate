const dotenv = require('dotenv');
const { transport, htmlEmail } = require('../../src/Helpers/mail');

describe('Helpers/mail', () => {
  beforeEach(() => { jest.resetModules(); dotenv.config(); });

  /**
   * transport(), htmlEmail()
   */
  test('`transport(), htmlEmail()` functions exist', () => {
    expect(() => transport()).not.toBeUndefined();
    expect(() => htmlEmail()).not.toBeUndefined();
  });
});
