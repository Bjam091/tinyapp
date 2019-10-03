const { assert } = require('chai');

const getUserByEmail  = require('../helpers.js');

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput)
  });
  it('should return null if the email isnt valid', function() {
    const user = getUserByEmail("fake@emailfaker.com", users)
    const expectedOutput = null;
    assert.equal(user, expectedOutput)
  })
});