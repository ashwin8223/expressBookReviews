const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
    let validUsers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Validation check
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: Missing username or password." });
    }

    // 2. Authenticate user against stored records
    if (authenticatedUser(username, password)) {
        // Generate JWT Access Token valid for 1 hour
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 3600 });

        // Save token & username in session cookie
        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login Credentials. Check username and password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization['username']; // Extracted from verified session

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    if (!review) {
        return res.status(400).json({ message: "Please provide a valid review query parameter." });
    }

    // Add or modify review under the user's name
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: `Review for ISBN ${isbn} added/updated successfully.` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
    } else {
        return res.status(404).json({ message: "No review found for this user to delete." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
