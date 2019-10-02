const urlDatabase = {
  "b2xVn2" : {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK" : {longURL: "http://www.google.com", userID: "userRandomID"}
};

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
  users,
  urlDatabase,

  //helper function that returns a single user,
  //can search the users DB by the email or id
  findUserBy: (key, val) => {
    for (let user in users) {
      if (users[user][key] === val) {
        return users[user];
      }
    }
  },
  generateRandomString: () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < 6; i++) {
      str += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return str;
  },
  
  //helper function to find each URL associated with a certain user
  urlsForUser: (id) => {
    let usersURLs = {};
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === id) {
        usersURLs[url] = urlDatabase[url].longURL;
      }
    }
    return usersURLs;
  }
};