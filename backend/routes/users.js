const express = require("express");
const { User, validate } = require("../models/User");
const bcrypt = require("bcrypt");
const verify_token = require("../middleware/verify_token")


const router = express.Router();

router.get("/", (req, res) =>
    User.find({})
        .then((users) => res.send(users))
        .catch((error) => res.status(400).send("Cannot get users"))
);

router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.send(user);
});
router.post("/", async (req, res) => {
    console.log(req.body)
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const emailExists = await User.findOne({ email: req.body.email });
    const usernameExists = await User.findOne({ username: req.body.username });
    if (emailExists) return res.status(400).send("Email already exists");
    if (usernameExists) return res.status(400).send("Username already exists");
    let user = User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = user.generateToken();
    try {
        res.header("x-auth-token", token).send({
            _id: user._id,
            username: user.username,
            email: user.email,
        });
    } catch (e) {
        res.status(400).send("Cannot create user");
    }
});
router.put("/:id", verify_token, async (req, res) => {
    if (req.user._id != req.params.id) {
        return res.status(401).send("Access Denied");
    }
    const emailExists = await User.findOne({ email: req.body.email });
    const usernameExists = await User.findOne({ username: req.body.username });
    if (emailExists) return res.status(400).send("Email already exists");
    if (usernameExists) return res.status(400).send("Username already exists");
    let user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).send("No user found with given credentials")
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    await user.save();
    try {
        res.send(user);
    } catch (err) {
        res.status(400).send("Something went wrong!");
    }
});
router.delete("/:id", async (req, res) => {
    const user = await User.findOne({_id: req.params.id});
    if (!user) return res.status(400).send("User doesn't exist");
    try {
        await User.deleteOne({_id: req.params.id});
    }catch (e){
        res.status(400).send("Error while deleting");
    }
});

module.exports = router;