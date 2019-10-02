const PORT = 8080;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');

const { users, urlDatabase, findUserBy, generateRandomString, urlsForUser } = require('./data/users');

app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

//////////////
//GET ROUTES//

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
    urls: urlsForUser(req.session.user_id),
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
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(urlDatabase, req.params.shortURL)) {
    res.send('<html><h3>URL does not exist. <a href="/">go back</a></h3></html>');
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: findUserBy('id', req.session.user_id),
    password: true,
    loggedIn: false
  };
  let loggedInURLs = urlsForUser(req.session.user_id);
  if (!req.session.user_id) {
    res.render('prompt', templateVars);
  } else if (!Object.prototype.hasOwnProperty.call(loggedInURLs, req.params.shortURL)) {
    templateVars.loggedIn = true;
    res.render('prompt', templateVars);
  } else {
    res.render('urls_show', templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (!Object.prototype.hasOwnProperty.call(urlDatabase, req.params.shortURL)) {
    console.log("THIS SHOULD BE tRUE");
    res.send('<html><h3>URL does not exist. <a href="/">go back</a></h3></html>');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
app.get('/register', (req, res) => {
  let templateVars = {
    user: findUserBy('id', req.session.user_id),
    password: true,
    email: false,
    missingInput: false
  };
  if (req.session.user_id) {
    res.redirect('/');
  }
  res.render('create_account', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = {
    user: findUserBy('id', req.session.user_id),
    email: true,
    password: true
  };
  if (req.session.user_id) {
    res.redirect('/');
  }
  res.render('login', templateVars);
});

///////////////
//POST ROUTES//

app.post('/urls', (req, res) => {
  let shortened = generateRandomString();
  urlDatabase[shortened] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  // would rather it did this...
  // res.redirect(`/urls`);
  res.redirect(`/urls/${shortened}`);
});

app.delete('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
    delete urlDatabase[req.params.shortURL];
  } else {
    res.send("you've misspeted");
  }

});
app.put('/urls/:id', (req, res) => {
  if (req.session.user_id) {
    urlDatabase[req.params.id].longURL = req.body.updateLong;
    res.redirect('/urls');
  }
});

app.post('/register', (req, res) => {
  let uniqueID = generateRandomString();
  let templateVars = {
    user: findUserBy('email', req.body.email),
    email: false,
    missingInput: false,
    password: false
  };
  if (findUserBy('email', req.body.email)) {
    templateVars.email = true;
    res.status(400).render('create_account', templateVars);
  } else if (!req.body.email || !req.body.password) {
    templateVars.missingInput = true;
    res.status(400).render('create_account', templateVars);
  } else {
    users[uniqueID] = {
      id: uniqueID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
  }
  req.session.user_id = uniqueID;
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