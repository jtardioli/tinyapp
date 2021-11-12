const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
let morgan = require('morgan');
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.set("view engine", "ejs");


const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRandomString = () => {
  let charset = "abcdefghijklmnopqrstuvwxyz123456789";
  let randomArr = [];
  for (let i = 0; i < 6; i++) {
    const ran = randomNum(0, 34);
    randomArr.push(charset[ran]);
  }
  return randomArr.join('');
};

const checkIfEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const verifyLogin = (email, password) => {
  if (checkIfEmail) {
    for (let user in users) {
      if (users[user].email === email) {
        if (bcrypt.compareSync(password, users[user].password)) {
          return users[user].id;
        }
      }
    }
  }
  return false;
};

const filteredURLs = (currentUser) => {
  let filteredURLs = {};
  if (currentUser) {
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === currentUser.id) {
        filteredURLs[url] = urlDatabase[url].longURL;
      }
    }
  }
  return filteredURLs;
};
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
  const currentUser = users[req.cookies["user_id"]];
  const filteredURLsObj = filteredURLs(currentUser);
  console.log(currentUser);
  console.log(users);
  console.log(urlDatabase);
  console.log(filteredURLs(currentUser));
  const templateVars = { user: currentUser, urls: filteredURLsObj };
  res.render("urls_index", templateVars);
});

// Create
app.get("/urls/new", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser};
  if (currentUser) {
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect('/login');
  
});

//Edit
app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const short = req.params.shortURL;
  const long = urlDatabase[short].longURL;
  const templateVars = {user: currentUser, shortURL: req.params.shortURL, longURL: long };
  res.render("urls_show", templateVars);

});
// Register
app.get("/register", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];

  const templateVars = {user: currentUser};
  
  res.render("register", templateVars);

});

// Login
app.get("/login", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];

  const templateVars = {user: currentUser};
  
  res.render("login", templateVars);

});

// ========================================= P O S T ==================================================
// Create
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

//Edit
app.post("/urls/:id", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  if (currentUser && currentUser.id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect(`/urls`);
    return;
  }
  res.send('This link does not belong to you!');
});

// Delete
app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
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
  if (verifyLogin(email, password)) {
    res.cookie('user_id', verifyLogin(email, password));
    res.redirect('/urls');
    return;
  }
  res.send('Status Code 403: Unsuccesful Login');
  
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

// Register
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.send('Status code 400: what you are looking for cant be found');
    return;
  }
  if (checkIfEmail(email)) {
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
  res.cookie('user_id', id);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

