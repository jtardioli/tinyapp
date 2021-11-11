const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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
        if (users[user].password === password) {
          return users[user].id;
        }
      }
    }
  }
  return false;
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
  }
};

// URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// home
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  const link = urlDatabase[req.params.shortURL];
  res.redirect(link);
  

});

app.get("/urls", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser, urls: urlDatabase };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const templateVars = { user: currentUser};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];
  const short = req.params.shortURL;
  const long = urlDatabase[short];
  const templateVars = {user: currentUser, shortURL: req.params.shortURL, longURL: long };
  res.render("urls_show", templateVars);

});
app.get("/register", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];

  const templateVars = {user: currentUser};
  
  res.render("register", templateVars);

});
app.get("/login", (req, res) => {
  const currentUser = users[req.cookies["user_id"]];

  const templateVars = {user: currentUser};
  
  res.render("login", templateVars);

});

// ========================================= P O S T ==================================================
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

//Edit
app.post("/urls/:id", (req, res) => {
  delete urlDatabase[req.params.id];
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

//Login
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  console.log(users);
  if (verifyLogin(email, password)) {
    res.cookie('user_id', verifyLogin(email, password));
    res.redirect('/urls');
    return;
  }
  res.send('Status Code 403: Unsuccesful Login');
  
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

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
  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

