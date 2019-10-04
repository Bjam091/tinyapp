//gets the user infromation based on their email being compared to the database

const getUserByEmail = function(email, users) {
  for (let uID in users) {
    if (users[uID].email === email) {

    return users[uID];
  } 
} return null
}

module.exports = getUserByEmail;