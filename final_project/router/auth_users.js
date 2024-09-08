const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};


//only registered users can login
// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
  return res.status(200).json({ token });
});


// Add a book review
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const username = decoded.username;
    const { isbn } = req.params;
    const { review } = req.body;

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    let book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    let userReview = book.reviews.find(r => r.username === username);
    if (userReview) {
      userReview.review = review;
    } else {
      book.reviews.push({ username, review });
    }

    return res.status(200).json({ message: "Review added/updated successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const username = decoded.username;
    const { isbn } = req.params;

    let book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.reviews = book.reviews.filter(r => !(r.username === username));

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
