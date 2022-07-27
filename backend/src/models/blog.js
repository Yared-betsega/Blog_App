const mongoose = require("mongoose");
const Joi = require("joi")
const authorize = require("../middleware/authorize")

const blogSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            min: 2,
            max: 50
        },
        author: {
            type: mongoose.ObjectId,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            required: true,
            default: Date.now
        },
        likes: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            max: 200
        },
    }
);
const Blog = mongoose.model("Post", blogSchema);

function validateBlog(blog){
    const schema = Joi.object(
        {
            name: Joi.string().min(2).max(50).required(),
            category: Joi.string().required(),
            description: Joi.string().max(200)
        }
    )
    return schema.validate(blog);
}

module.exports.Blog = Blog;
module.exports.validate = validateBlog;