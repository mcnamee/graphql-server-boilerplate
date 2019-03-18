const dotenv = require('dotenv');
const { post, listPosts, listDraftPosts } = require('../../../src/Resolvers/Query/Post');
const authHelpers = require('../../../src/Helpers/auth');

jest.mock('../../../src/Helpers/auth');

// Mock data
const mockPostData = {
  data: {
    post: {
      id: 'cjtav4dmh000v0888a6wi16nc',
      title: 'New Draft Post',
      content: 'Hello new post that\'s not posted yet',
      published: true,
      author: {
        firstName: 'Zeus',
        lastName: 'Zellot',
      },
    },
  },
};

// Mock Prisma responses
const context = {
  prisma: {
    post: jest.fn(() => mockPostData),
    posts: jest.fn(() => [mockPostData, mockPostData, mockPostData]),
  },
};

describe('Resolvers/Query/Post', () => {
  beforeEach(() => { jest.resetModules(); dotenv.config(); });

  /**
   * post()
   */
  test('`post()` should provide a single post', () => {
    const res = post(null, { id: mockPostData.data.post.id }, context);

    expect(res).toBeDefined();
    expect(res.data.post.id).toEqual(mockPostData.data.post.id);
  });

  /**
   * listPosts()
   */
  test('`listPosts()` should provide an array of results', () => {
    const res = listPosts(null, null, context);

    expect(res).toBeDefined();
    expect(res[0].data.post.id).toEqual(mockPostData.data.post.id);
  });

  /**
   * listDraftPosts()
   */
  test('`listDraftPosts()` should provide an array of results', () => {
    authHelpers.getUserId.mockResolvedValue(123); // eslint-disable-line

    const res = listDraftPosts(null, null, context);
    expect(res).toBeDefined();
    expect(res[0].data.post.id).toEqual(mockPostData.data.post.id);
  });
});
