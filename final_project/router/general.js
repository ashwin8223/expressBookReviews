const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4))
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }
    return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let matchingBooks = [];
    for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            matchingBooks.push(books[key]);
        }
    }
    return res.status(200).json(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let matchingBooks = [];
    for (let key in books) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            matchingBooks.push(books[key]);
        }
    }
    return res.status(200).json(matchingBooks);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }
    return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
