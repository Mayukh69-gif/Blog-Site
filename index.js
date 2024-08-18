import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 3000;

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/blogDB');

// Define a schema for your blog posts
const postSchema = new mongoose.Schema({
    title: String,
    description: String
});

// Create a model based on the schema
const Post = mongoose.model("Post", postSchema);

app.set('view engine', 'ejs');
app.use(express.static("styles"));
app.use(bodyParser.urlencoded({ extended: true }));

// Route to render the form for creating a new post
app.get('/form', (req, res) => {
    res.render('form.ejs');
});

// Route to render the homepage with all posts
app.get('/', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.render("index.ejs", { posts: posts });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error retrieving posts.");
    }
});

// Route to render a single post
app.get("/about/:id", async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);
        if (post) {
            res.render("about.ejs", { post: post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving post.');
    }
});

// Route to render the edit form for a specific post
app.get('/edit/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await Post.findById(postId);
        if (post) {
            res.render('edit.ejs', { post: post, postId: postId });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Error retrieving post.');
    }
});

// Route to update a specific post
app.post('/update/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        await Post.findByIdAndUpdate(postId, {
            title: req.body.title,
            description: req.body.description
        });
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error updating post.');
    }
});

// Route to delete a specific post
app.get("/delete/:id", async (req, res) => {
    const postId = req.params.id;
    try {
        await Post.findByIdAndDelete(postId);
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error deleting post.');
    }
});

// Route to handle form submission for creating a new post
app.post("/submit", async (req, res) => {
    const newPost = new Post({
        title: req.body.title,
        description: req.body.description
    });

    try {
        await newPost.save();
        console.log("Data saved successfully!");
        res.redirect('/');
    } catch (err) {
        console.log("Error saving data:", err);
        res.status(500).send("Error saving post.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
