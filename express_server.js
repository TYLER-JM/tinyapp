const express = require('express');
const app = express();
const PORT = 8080;

const bodyParser = require('body-parser');
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
  res.send('Hello!');
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});
// app.get('/urls/:shortURL', (req, res) => {
//   let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
//   res.render('urls_show', templateVars);
// });
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.post('/urls', (req, res) => {
  console.log(req.body);
  urlDatabase[generateRandomString()] = req.body.longURL;
  // res.render('urls_index');
  res.send("OKAY");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});