const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            min: 3, 
            max: 50
        },
        email: {
            type: String,
            required: true,
            unique: true,
            min: 5,
            max: 100
        },
        role: {
            type: String,
            required: true,
            default: "user"
        },
        password: {
            type: String,
            required: true,
            min: 4,
            max: 2048
        }
    }
);

// Generates a token for user
userSchema.methods.generateToken = function() {
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role
        },
        process.env["JWT_PRIVATE_KEY"]
    );
    return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
    const schema = Joi.object(
        {
            username: Joi.string().min(3).max(50).required(),
            email: Joi.string().min(5).max(100).required().email(),
            role: Joi.string().required(),
            password: Joi.string().min(4).max(2048).required()
        }
    );

    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;