const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const getUser = (req, res) => {
  const cookie = req.cookies["user_id"];
  const user = users[cookie];

  return user;
}


app.set("view engine", "ejs");


//renders the urls index page
app.get("/urls", (req, res) => {
  const user = getUser(req, res);

  let templateVars = { urls: urlDatabase, user: user, };
  res.render("urls_index", templateVars);
});

//creates a new short URL for a link
app.post("/urls", (req, res) => {
  let shortenedUrl = generateRandomString();
  urlDatabase[shortenedUrl] = req.body.longURL;
  res.redirect(`/urls/${shortenedUrl}`);
});

//renders the url new page
app.get("/urls/new", (req, res) => {
  const user = getUser(req, res);

  let templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

//renders the register page
app.get("/register", (req,res) => {
  const user = getUser(req, res);

  let templateVars = {
    user: user,
  };
  res.render("urls_register", templateVars);
});

//renders the login page
app.get("/login", (req,res) => {
  let user;
  let templateVars = {user: user};
  res.render("urls_login", templateVars);
});

//renders the shortURL page
app.get("/urls/:shortURL", (req, res) => {
  const user = getUser(req, res);

  let templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: user };
  res.render("urls_show", templateVars);
});

//redirects the short url to the long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


//shows in the console.log the server is running
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//logs a user in
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userKeys = Object.keys(users);
  userKeys.forEach((user) => {
    let value = users[user];
    if(email === value.email && password === value.password){
      res.cookie("user_id", users[user].id);
      res.redirect("/urls");
    } 
    else if(email === value.email && password !== value.password) {
        res.status(403).end();
      }
    })
});

//logs a user out
app.post("/urls/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//replaces a URL
app.post("/urls/:shortURL", (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//deletes a URL
app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//register
app.post("/register", (req,res) => {


  if (req.body.email === "" || req.body.password === ""){
    return res.status(400).end();
  }
  for(let uID in users){
    let value = users[uID];
    if(value.email === req.body.email){
      return res.status(400).end();
    } 
  }
  let userID = generateRandomString();
  users[userID] = { id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", users[userID].id);
  res.redirect("/urls");
});