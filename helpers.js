const getUserByEmail = function(email, users) {
  for (let uID in users) {
    if (users[uID].email === email) {

    return users[uID];
  } 
} return null
}

module.exports = getUserByEmail;