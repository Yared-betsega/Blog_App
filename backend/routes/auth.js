const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../models/User");
const Joi = require("joi");

const router = express.Router();

router.post("/", async (req, res) => {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404).send("Invalid email or password");
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) return res.status(400).send("Inavalid email or password");

    const token = user.generateToken();
    res.json({
        user: user,
        token: token
    });
});

function validate(req) {
    const schema = Joi.object({
      email: Joi.string().min(5).max(100).required(),
      password: Joi.string().min(4).max(50).required(),
    });
    return schema.validate(req);
  }

module.exports = router