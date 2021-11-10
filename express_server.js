const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
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


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  const link = urlDatabase[req.params.shortURL];
  res.redirect(link);
  

});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  const long = urlDatabase[short];
  const templateVars = { shortURL: req.params.shortURL, longURL: long };
  res.render("urls_show", templateVars);

});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

//Edit
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  console.log(req.body.longURL);
  delete urlDatabase[req.params.id];
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

