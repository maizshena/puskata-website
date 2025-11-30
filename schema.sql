CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Table Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Books
CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  cover_image VARCHAR(255),
  quantity INT DEFAULT 1,
  available INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Loans
CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  loan_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('pending', 'approved', 'returned', 'rejected') DEFAULT 'pending',
  fine DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Table Wishlist
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, book_id)
);

-- Insert default admin
INSERT INTO users (name, email, password, role) 
VALUES ('Admin Satu', 'admin@puskata.com', '$2b$10$/f51K02a4/78TsF.31Qvk..oZrQf8sA9ylQmEtcjlP7OQuFy3UsXy', 'admin');

DELETE FROM users WHERE email = 'admin@puskata.com';

SELECT * FROM users;
SELECT * FROM books;
SELECT * FROM categories;
SELECT * FROM loans;
