const bcrypt = require('bcryptjs');
const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const verifyLogin = (email, password, users) => {
  if (getUserByEmail(email, users) !== null) {
    const user = getUserByEmail(email, users);
    if (bcrypt.compareSync(password, user.password)) {
      return user.id;
    }
  }
  return false;
};

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

const filteredURLs = (currentUser, urlDatabase) => {
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
module.exports = {getUserByEmail, verifyLogin, generateRandomString, filteredURLs};