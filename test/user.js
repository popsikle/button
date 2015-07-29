var expect = require("chai").expect;
var funcs = require("../funcs");

var badUserEmail = 'freddie@mac.com'
var goodUserEmail = 'freddie@queen.com'
var goodUser = {
  firstName : 'Freddie',
  lastName : 'Mercury'
}


describe("Add User Function", function() {
  it("Should return user on create", function() {
    funcs.addUser(goodUserEmail, goodUser, function (err, user){
      expect(user).to.deep.equal(goodUser);
    });
  });
  it("Should fail on duplicate create", function() {
    funcs.addUser(goodUserEmail, goodUser, function (err, user){
      expect(err).to.equal('User Exists');
      expect(user).to.deep.equal(null);
    });
  });
});

describe("Get User Function", function() {
  it("Should return null if user DNE", function() {
    funcs.getUser(badUserEmail, function (err, user){
      expect(user).to.deep.equal(null);
    });
  });
  it("Should return user data set by addUser", function() {
    funcs.getUser(goodUserEmail, function (err, user){
      expect(user).to.deep.equal(goodUser);
    });
  });
});