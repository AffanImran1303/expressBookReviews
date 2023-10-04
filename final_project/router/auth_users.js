const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  "username":"Watson",
  "password":"111222"
}];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  const user_match = users.filter((user) => user.username === username);
  return user_match.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  const matchingUsers = users.filter((user) => user.username === username && user.password === password);
  return matchingUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", { expiresIn: 3600 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  }
  else {
    return res.status(208).json({ message: "User login not successful" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  try{
    const isbn = req.params.isbn;
    const book = books[isbn]
    // Get user name from session
    const username = req.session.authorization.username
    if (book) { //Check if book exists
        let review = req.body.review;
        const existingreview = books[isbn].reviews[username]
        if (existingreview !== undefined) { // Check if existing rating of user name
            // Delete old rating
            delete books[isbn].reviews[username]
        }
        // Update rating
        books[isbn] = {
            "author": book.author,
            "title": book.title,
            "reviews": {
                ...book.reviews,
                [username]: review
            }
        };
        res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    } else {
        res.send(`Unable to find book with ISBN ${isbn}.`);
    }
} catch (error) {
    console.error("An error occurred:", error);
}
});
// Delete a book review (task 9)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  try {
      const isbn = req.params.isbn;
      const book = books[isbn]
      // Get user name from session
      const username = req.session.authorization.username
      if (book) { //Check if book exists
          const existingreview = books[isbn].reviews[username]
          if (existingreview !== undefined) { // Check if existing rating exist
              // Delete rating
              delete books[isbn].reviews[username]
              res.send(`Review for the book with ISBN ${isbn} posted by the user ${username} has been deleted.`);
          } else {
              res.send(`Book review for book with ISBN ${isbn} for user ${username} not existing.`);
          }
      } else {
          res.send("Unable to find book!");
      }
  } catch (error) {
      console.error("An error occurred:", error);
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
