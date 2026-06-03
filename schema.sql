-- table for blogs
CREATE TABLE Blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    publish_date DATETIME NOT NULL,
    blogtext TEXT NOT NULL
);

-- table for comments
CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Blogs(id) ON DELETE CASCADE
);