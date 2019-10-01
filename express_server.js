const PORT = 8080;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

const { users, checkExisting, findUserBy} = require('./data/users');
//goal is to require an object and access the methods like users.method()

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
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK" : "http://www.google.com"
};
// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// };


app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  console.log("hey");
  res.send('Hello!');
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    ///CHANGE USERNAME///
    // username: req.cookies.username
    user: findUserBy('id', req.cookies.user_id)
  };
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  let templateVars = {
    ///CHANGE USERNAME///
    // username: req.cookies.username
    user: findUserBy('id', req.cookies.user_id)
  };
  res.render('urls_new', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    ///CHANGE USERNAME///
    // username: req.cookies.username
    user: findUserBy('id', req.cookies.user_id)
  };
  res.render('urls_show', templateVars);
});
app.get('/register', (req, res) => {
  let templateVars = {
    ///CHANGE USERNAME///
    // username: req.cookies.username
    user: findUserBy('id', req.cookies.user_id)
  };
  res.render('create_account', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {
    user: findUserBy('id', req.cookies.user_id)
  };
  res.render('login', templateVars);
});


app.post('/urls', (req, res) => {
  let shortened = generateRandomString();
  urlDatabase[shortened] = req.body.longURL;
  res.redirect(`/urls/${shortened}`);
});
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  console.log(urlDatabase);
  res.redirect('/urls');
  delete urlDatabase[req.params.shortURL];
});
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.updateLong;
  console.log(req.body.updateLong);
  res.redirect('/urls');
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
      password: req.body.password
    };
  }
  console.log(users);
  //set a user_id cookie containing uniqueID
  res.cookie('user_id', uniqueID);
  res.redirect('/urls');
});

//THIS WILL CHANGE//
app.post('/login', (req, res) => {
  //set a cookie <res.cookie> named username to the value passed in through the form
  //<req.body.username>
  //redirect the browser back to /urls
  let user = findUserBy('email', req.body.email);
  if (!user) {
    res.status(403).send("email not found");
  } else if (user.password !== req.body.password) {
    res.status(403).send('password incorrect');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
  // console.log(req.cookies);
});
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


// app.get('/u/:shortURL', (req, res) => {
//   const longURL = urlDatabase[req.params];
//   res.redirect(longURL);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});