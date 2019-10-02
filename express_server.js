const PORT = 8080;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const { users, findUserBy} = require('./data/users');
//goal is to require an object and access the methods like users.method()
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(cookieParser());
app.set('view engine', 'ejs');

//copied from stack overflow
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return str;
};

const urlDatabase = {
  "b2xVn2" : {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK" : {longURL: "http://www.google.com", userID: "userRandomID"}
};

//pass into it req.session.user_id to
//return an object with the users short and long urls
const urlsForUser = (id, ob) => {
  let usersURLs = {};
  for (let url in ob) {
    if (ob[url].userID === id) {
      usersURLs[url] = ob[url].longURL;
    }
  }
  return usersURLs;
};

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: findUserBy('id', req.session.user_id),
    password: true
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: findUserBy('id', req.session.user_id),
    password: true
  };
  if (!templateVars.user) {
    res.redirect('/login'); //redirect to promt to login/register
  } else {
    res.render('urls_new', templateVars);
  }
});
app.get('/urls/:shortURL', (req, res) => {

  if (!Object.prototype.hasOwnProperty.call(urlDatabase, req.params.shortURL)) {
    console.log("THIS SHOULD BE tRUE");
    res.send('<html><h3>URL does not exist. <a href="/">go back</a></h3></html>');
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: findUserBy('id', req.session.user_id),
    password: true,
    loggedIn: false
  };
  let loggedInURLs = urlsForUser(req.session.user_id, urlDatabase);
  //ADDED THIS CONDITION
  if (!req.session.user_id) {
    console.log("NO USER LOGGED IN");
    res.render('prompt', templateVars);
  } else if (!Object.prototype.hasOwnProperty.call(loggedInURLs, req.params.shortURL)) {
    console.log("WRONG USER LOGGED IN");
    templateVars.loggedIn = true;
    res.render('prompt', templateVars);
  } else {
    res.render('urls_show', templateVars);
  }
});
app.get('/register', (req, res) => {
  let templateVars = {
    user: findUserBy('id', req.session.user_id),
    password: true
  };
  res.render('create_account', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {
    user: findUserBy('id', req.session.user_id),
    email: true,
    password: true
  };
  res.render('login', templateVars);
});


app.post('/urls', (req, res) => {
  let shortened = generateRandomString();
  urlDatabase[shortened] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  //changed this...
  res.redirect(`/urls`);
  // res.redirect(`/urls/${shortened}`);
});
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    delete urlDatabase[req.params.shortURL];
  }
});
app.post('/urls/:id', (req, res) => {
  if (req.session.user_id) {
    urlDatabase[req.params.id].longURL = req.body.updateLong;
    console.log(req.body.updateLong);
    res.redirect('/urls');
  }
});

app.post('/register', (req, res) => {
  let uniqueID = generateRandomString();
  if (findUserBy('email', req.body.email)) {
    res.status(400).send('400 error, user email already exists');
  } else if (!req.body.email || !req.body.password) {
    res.status(400).send('400 error, both fields are required');
  } else {
    users[uniqueID] = {
      id: uniqueID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
  }
  // console.log(users);
  req.session.user_id = uniqueID;
  // res.cookie('user_id', uniqueID);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  let user = findUserBy('email', req.body.email);
  let templateVars = {
    user: findUserBy('email', req.body.email),
    email: true,
    password: true
  };
  if (!user) {
    templateVars.email = false;
    req.session = null;
    res.status(403).render("login", templateVars);
  } else if (!bcrypt.compareSync(req.body.password, user.password)/* user.password !== req.body.password */) {
    templateVars.password = false;
    req.session = null;
    res.status(403).render('login', templateVars);
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
    // res.cookie('user_id', user.id);
  }
});
app.post('/logout', (req, res) => {
  req.session = null; //=>to destroy the session
  // res.clearCookie('user_id');
  res.redirect('/urls');
});


// app.get('/u/:shortURL', (req, res) => {
//   const longURL = urlDatabase[req.params];
//   res.redirect(longURL);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});