const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "blog.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            publish_date TEXT NOT NULL,
            blogtext TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS Comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES Blogs(id) ON DELETE CASCADE
        )
    `);

    db.run("PRAGMA foreign_keys = ON");
});

async function createPost(data) {
    const title = data.title;
    const blogtext = data.blogtext;
    const publish_date = new Date().toISOString();

    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Blogs (title, publish_date, blogtext) VALUES (?, ?, ?)",
            [title, publish_date, blogtext],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

async function editPost(id, title, blogtext) {
    return new Promise((resolve, reject) => {
        db.run(
            "UPDATE Blogs SET title = ?, blogtext = ? WHERE id = ?",
            [title, blogtext, id],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

async function deletePost(id) {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM Blogs WHERE id = ?",
            [id],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

async function getPost(id) {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT id, title, publish_date, blogtext FROM Blogs WHERE id = ?",
            [id],
            (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            }
        );
    });
}

async function getRecentPosts() {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT id, title, publish_date, blogtext FROM Blogs ORDER BY publish_date DESC LIMIT 3",
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

async function getAllPosts() {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT id, title, publish_date, blogtext FROM Blogs ORDER BY publish_date DESC",
            [],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

async function createComment(postId, author, content) {
    const created_at = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO Comments (post_id, author, content, created_at) VALUES (?, ?, ?, ?)",
            [postId, author, content, created_at],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

async function getComments(postId) {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT id, post_id, author, content, created_at FROM Comments WHERE post_id = ? ORDER BY created_at ASC",
            [postId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

async function deleteComment(id) {
    return new Promise((resolve, reject) => {
        db.run(
            "DELETE FROM Comments WHERE id = ?",
            [id],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    getPost,
    getRecentPosts,
    getAllPosts,
    createComment,
    getComments,
    deleteComment,
};