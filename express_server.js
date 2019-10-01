const PORT = 8080;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

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
    username: req.cookies.username
  };
  res.render('urls_index', templateVars);
});
app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies.username
  };
  res.render('urls_new', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render('urls_show', templateVars);
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
app.post('/login', (req, res) => {
  //set a cookie <res.cookie> named username to the value passed in through the form
  //<req.body.username>
  //redirect the browser back to /urls
  res.cookie('username', req.body.username);
  res.redirect('/urls');
  console.log(req.cookies);
});
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


// app.get('/u/:shortURL', (req, res) => {
//   const longURL = urlDatabase[req.params];
//   res.redirect(longURL);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});