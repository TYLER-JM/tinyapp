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

//goal is to export an object of functions without exporting the users object

module.exports = {
  users, //get all users
  // all: () => users,
  //return a single user
  findUserBy: (key, val) => {
    for (let user in users) {
      if (users[user][key] === val) {
        return users[user];
      }
    }
  },
  //get number of users
  //does an email exist already?
  checkExisting: (email) => {
    for (let user in users) {
      if (users[user].email === email) {
        return true;
      }
      return false;
    }
  }
};