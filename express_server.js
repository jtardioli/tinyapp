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

// User Database
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
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "joshua.tardioli@gmail.com",
    password: "1234"
  }
};

// URL Database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "ag57d4"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

// home
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const link = urlDatabase[req.params.shortURL].longURL;
    res.redirect(link);
    return;
  }
  res.send('Error: webpage not found');
});

// Home Page
app.get("/urls", (req, res) => {
  const currentUser = users[req.session.user_id];
  const filteredURLsObj = filteredURLs(currentUser, urlDatabase);
  console.log(currentUser);
  console.log(users);
  console.log(urlDatabase);
  console.log(filteredURLs(currentUser, urlDatabase));
  const templateVars = { user: currentUser, urls: filteredURLsObj };
  res.render("urls_index", templateVars);
});

// Create
app.get("/urls/new", (req, res) => {
  const currentUser = users[req.session.user_id];
  const templateVars = { user: currentUser};
  if (currentUser) {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect('/login');
  
});

//Edit
app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.session.user_id];
  const short = req.params.shortURL;
  const long = urlDatabase[short].longURL;
  const templateVars = {user: currentUser, shortURL: req.params.shortURL, longURL: long };
  res.render("urls_show", templateVars);

});
// Register
app.get("/register", (req, res) => {
  const currentUser = users[req.session.user_id];

  const templateVars = {user: currentUser};
  
  res.render("register", templateVars);

});

// Login
app.get("/login", (req, res) => {
  const currentUser = users[req.session.user_id];

  const templateVars = {user: currentUser};
  
  res.render("login", templateVars);

});

// ========================================= P O S T ==================================================
// Create
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

//Edit
app.post("/urls/:id", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && currentUser.id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls`);
    return;
  }
  res.send('This link does not belong to you!');
});

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = users[req.session.user_id];
  if (currentUser && currentUser.id === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
    return;
  }
  res.send('This link does not belong to you!');
});

//Login
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (verifyLogin(email, password, users)) {
    req.session.user_id = verifyLogin(email, password, users);
    res.redirect('/urls');
    return;
  }
  res.send('Status Code 403: Unsuccesful Login');
  
});

// Logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

// Register
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.send('Status code 400: what you are looking for cant be found');
    return;
  }
  if (getUserByEmail(email, users)) {
    res.send('This email is already taken!');
    return;
  }

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

