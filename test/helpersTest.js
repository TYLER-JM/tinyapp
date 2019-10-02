const { assert } = require('chai');
const { findUserBy } = require('../data/users');

describe('findUserBy', function() {
  it('should return a user with a valid email', function() {
    const user = findUserBy('email', 'user@example.com');
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user.id, expectedOutput);
  });
  it('should return undefined when email is not in DB', () => {
    const user = findUserBy('email', 'noUser@gmail.com');
    assert.strictEqual(user, undefined);
  });
  it('should return the correct email...', () => {
    const user = findUserBy('id', 'user2RandomID');
    assert.strictEqual(user.email, 'user2@example.com');
  });
});