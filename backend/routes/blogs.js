const express = require("express");
const {Blog, validate} = require("../models/Blog")
const {User} = require("../models/User")
const router = express.Router(); 

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
router.post("/", async (req, res) => {
    const error = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
})
router.put("/", async (req, res) => {
    
})
router.delete("/", async (req, res) => {
    
})