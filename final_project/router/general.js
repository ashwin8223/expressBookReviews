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
    const getBooks = new Promise((resolve, reject) => {
        resolve(books);
    });

    getBooks.then((bookList) => {
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    }).catch((err) => {
        return res.status(500).json({ message: err.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const findByISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject(new Error(`Book with ISBN ${isbn} not found`));
        }
    });

    findByISBN
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(404).json({ message: error.message });
        });
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const targetAuthor = req.params.author.toLowerCase();

    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            const matchingBooks = [];

            keys.forEach((key) => {
                if (books[key].author.toLowerCase() === targetAuthor) {
                    matchingBooks.push(books[key]);
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error(`No books found by author: ${req.params.author}`));
            }
        });

        const result = await getBooksByAuthor;
        return res.status(200).send(JSON.stringify(result, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const targetTitle = req.params.title.toLowerCase();

    try {
        const getBooksByTitle = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            const matchingBooks = [];

            keys.forEach((key) => {
                if (books[key].title.toLowerCase() === targetTitle) {
                    matchingBooks.push(books[key]);
                }
            });

            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error(`No books found with title: ${req.params.title}`));
            }
        });

        const result = await getBooksByTitle;
        return res.status(200).send(JSON.stringify(result, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
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
