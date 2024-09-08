const express = require('express');
let books = require("./booksdb.js"); // Assuming books is an object containing book data
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "Username already exists. Please choose another one." });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully." });
});


// Get the book list available in the shop
const axios = require('axios');

public_users.get('/', function (req, res) {
  axios.get('http://localhost:5000/books')
    .then(response => {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(response.data));
    })
    .catch(error => {
      return res.status(500).json({ message: "Error fetching the books list." });
    });
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/books/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Book not found with this ISBN." });
  }
});



// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get('http://localhost:5000/books');
    const booksByAuthor = [];

    for (let isbn in response.data) {
      if (response.data[isbn].author === author) {
        booksByAuthor.push(response.data[isbn]);
      }
    }

    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    } else {
      return res.status(404).json({ message: "No books found by this author." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author." });
  }
});



// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();

  try {
    const response = await axios.get('http://localhost:5000/books');
    const booksByTitle = [];

    for (let isbn in response.data) {
      if (response.data[isbn].title.toLowerCase() === title) {
        booksByTitle.push(response.data[isbn]);
      }
    }

    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    } else {
      return res.status(404).json({ message: "No books found with this title." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title." });
  }
});



// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    const reviews = books[isbn].reviews || {};
    return res.status(200).json(reviews);
  } else {
    return res.status(404).json({ message: "Book not found with this ISBN." });
  }
});

module.exports.general = public_users;
