const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const getUserByEmail = require("./helpers.js");

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'user_id',
  keys: ["boop"],
  maxAge: 24 * 60 * 60 * 1000
}));
app.set("view engine", "ejs");

//empty urlDatabase for the urls created by users
const urlDatabase = {
};
//empty users database for the users once created
const users = {
};

//generates the random string for creating the shortURL code
const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


//returns the user infromation with the cookie attached
const getUser = (req, res) => {
  const cookie = req.session["user_id"];
  const user = users[cookie];
  return user;
};


//this function sorts the URLs and return the filtered ones for a specifc 
const urlsForUserID = (userId) => {
  let filterUrls = new Object();
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === userId) {
      filterUrls[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  } return filterUrls;
};


//renders the urls index page
app.get("/urls", (req, res) => {
  const user = getUser(req, res);
  let templateVars = { urls: urlsForUserID(req.session["user_id"]), user: user, };
  res.render("urls_index", templateVars);
});


//creates a new short URL for a link
app.post("/urls", (req, res) => {
  let shortenedUrl = generateRandomString();
  for (let uID in users) {
    let value = users[uID];

    urlDatabase[shortenedUrl] = {
      longURL: req.body.longURL,
      userID: value.id
    };
  }
  res.redirect(`/urls/${shortenedUrl}`);
});


//renders the url new page
app.get("/urls/new", (req, res) => {
  const user = getUser(req, res);
 
  if (user) {
    let templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


//renders the register page
app.get("/register", (req,res) => {
  const user = getUser(req, res);

  if (user) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: user,
    };
    res.render("urls_register", templateVars);
  }
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
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: user,
    fakeUser: urlDatabase[req.params.shortURL].userID};
  res.render("urls_show", templateVars);
});


//redirects the short url to the long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// for the / url, sends users to the correct place
app.get("/", (req, res) => {
  const user = getUser(req, res);
  if (user) {
    res.redirect("/urls");
  } else
    res.redirect("/login");
});


//shows in the console.log the server is running
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


//logs a user in
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (req.body.email === undefined) {
    res.status(403).end();
    return;
  }
  
  let userId = null;
  let user = getUserByEmail(email,users);
  if (user && bcrypt.compareSync(password, user.password)) {
    userId = user.id;
  }

  if (userId !== null) {
    req.session["user_id"] = userId;
    res.redirect("/urls");
  } else {
    res.status(403).end();
  }
});

//logs a user out
app.post("/urls/logout", (req,res) => {
  req.session =  null;
  res.redirect("/urls");
});

//edit a URL
app.post("/urls/:shortURL", (req,res) => {
  let currentUser = req.session["user_id"];
  let urlOwner = urlDatabase[req.params.shortURL].userID;

  if (currentUser === urlOwner) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect("/urls");
});

//deletes a URL
app.post("/urls/:shortURL/delete", (req,res) => {
  let currentUser = req.session["user_id"];
  let urlOwner = urlDatabase[req.params.shortURL].userID;

  if (currentUser === urlOwner) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect("/urls");
});

//register
app.post("/register", (req,res) => {
  let email = req.body.email;

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).end();
  }

  let user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).end();
  }
  
  let userID = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[userID] = { id: userID,
    email: req.body.email,
    password: hashedPassword
  };

  req.session["user_id"] = users[userID].id;
  res.redirect("/urls");
});