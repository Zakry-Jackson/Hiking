const express = require("express");
const { readdirSync } = require("fs");
const path = require("path");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "templates"));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use("/static", express.static(path.join(__dirname, "resources")));

const db = require("./data.js");

// ---------------------------------------------------------------------------------------------------

// home page
app.get("/", async (req, res) => {
    try {
        // query recent 3 posts
        const posts = await db.getRecentPosts();

        // render home page
        res.render("home", {posts});
    } 
    catch (err) {
        console.error(err);
        res.status(500).send("Problem loading home page");
    }
});

// ---------------------------------------------------------------------------------------------------

// look at a particular blog post
app.get("/post/:id", async (req, res) => {
    // get the post id
    const id = req.params.id;

    // query the post by its id
    try {
        const post = await db.getPost(id);

        // if post doesnt exist
        if (!post) {
            return res.status(404).render("404");
        }

        const comments = await db.getComments(id);

        // render page with the post picked
        res.render("post", {post, comments});
    } 
    catch (err) {
        console.error("Problem loading post:", err);
        res.status(500).send("Problem loading post");
    }
    
});

// make a new comment on a post
app.post("/post/:id/comments", async (req, res) => {
    const postId = req.params.id;
    const {author, content} = req.body || {};

    if (!author || !content) {
        return res.status(400).json({ok: false, error: "Author/content field(s) are empty"});
    }

    try {
        const commentId = await db.createComment(postId, author, content);
        const createdAt = new Date().toString().slice(0, 21);

        res.json({ok: true, id: commentId, author, content, created_at: createdAt,});
    }
    catch (err) {
        console.error("Problem creating comment:", err);
        res.status(500).json({ok: false, error: "Problem creating comment"});
    }
});

// look at list of all posts
app.get("/posts", async (req, res) => {
    try {
        // query every single post
        const posts = await db.getAllPosts();

        // render page with every post listed
        res.render("blog_list", {posts});
    } 
    catch (err) {
        console.error("Problem loading all posts:", err);
        res.status(500).send("Problem loading all posts");
    }
});

// ---------------------------------------------------------------------------------------------------

// CREATING NEW POSTS

// show the from for creating a new post (title and blog text, date is auto)
app.get("/admin/new", (req, res) => {
    // render a new post form
    res.render("new_post");
});

// create the new post
app.post("/admin/new", async (req, res) => {
    try {
        // read the form
        const {title, blogtext} = req.body;

        // validate fields
        if (!title || !blogtext) {
            return res.status(400).send("Title and body are required to post.");
        }

        // insert the post into the db
        const newId = await db.createPost({title, blogtext});

        // after it's made, go to the post's page
        res.redirect(`/post/${newId}`);
    } 
    catch (err) {
        console.error("Problme creating post:", err);
        res.status(500).send("Problem creating post");
    }
});

// ---------------------------------------------------------------------------------------------------

// EDITING POSTS

// form for editing post
app.get("/admin/edit/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // query post by id
        const post = await db.getPost(id);

        // if the post doesn't exists, error
        if (!post) {
            return res.status(404).render("404");
        }

        // rendder the edit post form page
        res.render("edit_post", {post});
    } 
    catch (err) {
        console.error("Problem loading editing form:", err);
        res.status(500).send("Problem loading editing form");
    }
});

// update the post
app.post("/admin/edit/:id", async (req, res) => {
    const id = req.params.id;

    // read the new form
    const {title, blogtext} = req.body;

    try {
        if (!title || !blogtext) {
            return res.status(400).send("Title and body are required to post.")
        }

        // update post in db
        await db.editPost(id, title, blogtext);

        //redirect to page of post that was just updated
        res.redirect(`/post/${id}`);
    } 
    catch (err) {
        console.error("Problem updating post:", err);
        res.status(500).send("Problem udpating post");
    }
});

// ---------------------------------------------------------------------------------------------------

// DELETING POSTS / comments

app.post("/admin/delete/:id", async (req, res) => {
    const id = req.params.id;

    try {
        // delete the post from the db
        await db.deletePost(id);

        // go back to the full list after deleting
        res.redirect("/posts");
    } 
    catch (err) {
        console.error("Problem deleting post:", err);
        res.status(500).send("Problem deleting post");
    }
});

app.post("/admin/comments/:id/delete", async (req, res) => {
    const commentId = req.params.id;
    const {postId} = req.body;

    try {
        // delete comment on post from the db
        await db.deleteComment(commentId);

        // go back to the post after deleting
        res.redirect(`/post/${postId}`);
    }
    catch (err) {
        console.error("Problem deleting comment:", err);
        res.status(500).send("Problem deleting comment");
    }
});

// ---------------------------------------------------------------------------------------------------

// 404
app.use((req, res) => {
    res.status(404).render("404");
});

// ---------------------------------------------------------------------------------------------------

// Start server
app.listen(4131, () => {
    console.log('http://localhost:4131')
});