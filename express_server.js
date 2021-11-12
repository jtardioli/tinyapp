const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const {getUserByEmail, verifyLogin, generateRandomString, filteredURLs} = require('./helpers');
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

// Data
const users = {};
const urlDatabase = {};

// Home
app.get("/", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

// Link to Long URL
app.get("/u/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  // fetch shortURL id
  if (urlDatabase[req.params.shortURL]) {
    // fetch longURL id
    const link = urlDatabase[req.params.shortURL].longURL;
    res.redirect(link);
    return;
  }
  const templateVars = { user: currentUser, code: 404, message: 'The link you tried to access is not avaliable'};
  res.render('error_handler', templateVars);
});

// Show URL
app.get("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];
  //filter URLs for current user
  const filteredURLsObj = filteredURLs(currentUser, urlDatabase);
  const templateVars = { user: currentUser, urls: filteredURLsObj };
  res.render("urls_index", templateVars);
});

// Create URL
app.get("/urls/new", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser};
  if (currentUser) {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect('/login');
});

//Edit URL
app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  const short = req.params.shortURL;

  
  if (currentUser && // check for current user
    urlDatabase[short] && // link exists in the database
  currentUser.id === urlDatabase[short].userID) { // user owns said link

    const long = urlDatabase[short].longURL;
    const templateVars = {user: currentUser, shortURL: req.params.shortURL, longURL: long };
    res.render("urls_show", templateVars);
    return;
  }
  const templateVars = { user: currentUser, code: 404, message: 'This link if not avaliable'};
  res.render('error_handler', templateVars);
  return;

});

// Register
app.get("/register", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: currentUser};
  res.render("register", templateVars);
});

// Login
app.get("/login", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: currentUser};
  res.render("login", templateVars);
});

// ========================================= P O S T ==================================================

// Create URL
app.post("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];
  const shortURL = generateRandomString();
  if (currentUser) {
    // add new url to database
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`urls/${shortURL}`);
    return;
  }
  const templateVars = { user: currentUser, code: 401, message: 'You must be loged in to do that'};
  res.render('error_handler', templateVars);
});

//Edit URL
app.post("/urls/:id", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && // checl if user exists
    currentUser.id === urlDatabase[req.params.id].userID) { // check if url belongs to user
    // reset the long id
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls`);
    return;
  }
  const templateVars = { user: currentUser, code: 403, message: 'This link does not belong to you!'};
  res.render('error_handler', templateVars);
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && // check for user
    currentUser.id === urlDatabase[req.params.shortURL].userID) { // check if url belongs to user
      
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
    return;
  }
  const templateVars = { user: currentUser, code: 403, message: 'This link does not belong to you!'};
  res.render('error_handler', templateVars);
});

//Login
app.post("/login", (req, res) => {
  const currentUser = users[req.session.user_id];
  const {email, password} = req.body;
  if (verifyLogin(email, password, users)) {
    req.session.user_id = verifyLogin(email, password, users);
    res.redirect('/urls');
    return;
  }
  const templateVars = { user: currentUser, code: 401, message: 'Incorrect email or password'};
  res.render('error_handler', templateVars);
});

// Logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('urls');
});

// Register
app.post("/register", (req, res) => {
  const currentUser = users[req.session.user_id];
  const {email, password} = req.body;

  // check for blank input
  if (!email || !password) {
    const templateVars = { user: currentUser, code: 400, message: 'Please fill out the entire form'};
    res.render('error_handler', templateVars);
    return;
  }

  // check if email is already im use
  if (getUserByEmail(email, users)) {
    const templateVars = { user: currentUser, code: 409, message: 'That email is already taken'};
    res.render('error_handler', templateVars);
    return;
  }
  //success
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  req.session.user_id = id;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

