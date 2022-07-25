const express = require("express");
const {Blog, validate} = require("../models/Blog")
const {User} = require("../models/User")
const router = express.Router(); 
const authorize = require("../middleware/authorize")
const {Role} = require("../models/Role")
router.get("/", async (req, res) => {
    Blog.find()
        .then((blogs) => res.send(blogs))
        .catch((error) => res.status(400).send("Cannot fetch data..."));
})
router.get("/:id", async (req, res) => {
    const blog = Blog.findOne({_id: req.params.id});
    if (!blog) return res.status(404).send("Blog not found");
    res.send(blog);
})
// route to get posts by a given username
router.get("/:username", async (req, res) => {
    const user = User.findOne({username: req.params.username})
    if (!username) return res.status(404).send("User doesn't exist")

    const blogs = Blog.find({author: user._id})
    res.send(blogs)
})
router.post("/", authorize(Role.Admin), async (req, res) => {
    const error = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const blog = Blog({
        name: req.body.name,
        author: req.body.author,
        category: req.body.category,
        description: req.body.description,
    });
    await blog.save();
    res.send(blog);
})        
router.put("/:id", authorize(Role.Admin), async (req, res) => {
    const blog = Blog.findOne({_id: req.params.id});
    if (!blog) return res.status(404).send("Blog not found to be edited!")
    blog.name = req.body.name || blog.name;
    blog.author = req.body.author || blog.author;
    blog.category = req.body.category || blog.category;
    blog.description = req.body.description || blog.description;
    await blog.save();
    res.send(blog);
})
router.delete("/:id", authorize(Role.Admin), async (req, res) => {
    let blog = Blog.findOne({_id: req.params.id});
    if (!blog) return res.status(404).send("Blog not found to be deleted!");
    await blog.delete();
    res.status(204).send("Blog deleted succesfully!");
});