const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
var ISBN = require('isbn').ISBN;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "USERNAME": username, "PASSWORD": password });
      return res.status(200).json({ message: `User ${username} registered` });
    }
    else {
      return res.status(400).json({ message: `User ${username} not registered` });
    }
  }
  res.status(404).json({ message: "MUST PROVIDE USERNAME AND PASSWORD" });
});

function getBooks() {
  return new Promise((res, rej) => {
    res(books);
  });
}
function byIsbn(isbn) {
  return new Promise((resolve, reject) => {
    let isbnNum = parseInt(isbn);
    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  })
}
// Get the book list available in the shop
public_users.get('/', (req, res) => {
  //Write your code here
  return res.json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const author = req.params.author;
  getBooks();
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  byIsbn(isbn)
    .then(result => res.send(result.reviews), error => res.status(error.status).json({ message: error.message }))
  // return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
