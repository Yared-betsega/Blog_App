const express = require("express");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const { User, validate } = require("../models/User");
const bcrypt = require("bcrypt");
const verify_token = require("../middleware/verify_token");
const jwt_decode = require("jwt-decode")
const verifyIdToken = require("../middleware/google")

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *   summary: Get all users
 *   tags:
 *    - users
 *   responses:
 *    '200':
 *     description: successful operation
 *    '400':
 *     description: Cannot get users
 */
router.get("/", (req, res) =>
  User.find({})
    .then((users) => res.send(users))
    .catch((error) => res.status(400).send("Cannot get users"))
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *  get:
 *   summary: Get a single user with the given id
 *   tags:
 *    - users
 *   parameters:
 *    - in: path
 *      name: id
 *      schema:
 *          type: string
 *      required: true
 *      description: ID of the user to be fetched
 *   responses:
 *    '200':
 *     description: successful operation
 *    '404':
 *     description: User not found
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) return res.send(user);
    res.status(404).send("User not found");
  } catch (e) {
    return res.status(404).send("User not found");
  }
});

/**
 * @swagger
 * /api/v1/users:
 *  post:
 *   summary: Add a new user to the users repository
 *   tags:
 *    - users
 *   parameters:
 *    - in: body
 *      name: user
 *      description: Data for authentication
 *      schema:
 *        type: object
 *        required:
 *          - username
 *          - email
 *          - role
 *          - password
 *        properties:
 *          username:
 *            type: string
 *          email:
 *            type: string
 *          role:
 *            type: string
 *          password:
 *            type: string
 *   responses:
 *    '200':
 *     description: successful operation
 *    '400':
 *     description: Invalid user data
 *    '409':
 *     description: User already exists
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const emailExists = await User.findOne({ email: req.body.email });
    const usernameExists = await User.findOne({ username: req.body.username });
    if (emailExists) return res.status(409).send("user already exists");
    if (usernameExists) return res.status(409).send("user already exists");

    const cloudinary_image = await cloudinary.uploader.upload(req.file.path, {
      upload_preset: "blog_app_images",
    });
    let user = User({
      username: req.body.username,
      email: req.body.email,
      role: req.body.role,
      avatar: cloudinary_image.secure_url,
      cloudinary_id: cloudinary_image.public_id,
      password: req.body.password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = user.generateToken();
    try {
      res.header("x-auth-token", token).send(user);
    } catch (e) {
      res.status(400).send("Cannot create user");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/google", verifyIdToken, async (req, res) => {
    console.log(req.user)
})
/**
 * @swagger
 * /api/v1/users/{id}:
 *  put:
 *   summary: Update a single user with the given id
 *   tags:
 *    - users
 *   parameters:
 *    - in: path
 *      name: id
 *      schema:
 *          type: string
 *      required: true
 *      description: ID of the user to be updated
 *    - in: header
 *      name: x-auth-token
 *      description: An authorization token
 *      required: true
 *      type: string
 *   responses:
 *    '200':
 *     description: successful operation
 *    '404':
 *     description: No user found with the given credentials
 *    '403':
 *     description: Access Denied
 *    '409':
 *     description: User already exists
 *    '500':
 *     description: Internal server error. Can't update user!
 */
router.put("/:id", verify_token, upload.single("image"), async (req, res) => {
  if (req.user._id != req.params.id) {
    return res.status(403).send("Access Denied");
  }
  const emailExists = await User.findOne({ email: req.body.email });
  const usernameExists = await User.findOne({ username: req.body.username });
  if (emailExists) return res.status(409).send("User already exists");
  if (usernameExists) return res.status(409).send("User already exists");
  let user = await User.findOne({ _id: req.params.id });
  if (!user)
    return res.status(404).send("No user found with given credentials");

  try {
    await cloudinary.uploader.destroy(user.cloudinary_id);
    const result = await cloudinary.uploader.upload(req.file.path);
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.avatar = result.secure_url || user.avatar;
    user.cloudinary_id = result.public_id || user.cloudinary_id;
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *  delete:
 *   summary: delete a single user with the given id
 *   tags:
 *    - users
 *   parameters:
 *    - in: path
 *      name: id
 *      schema:
 *          type: string
 *      required: true
 *      description: ID of the user to be updated
 *    - in: header
 *      name: x-auth-token
 *      description: An authorization token
 *      required: true
 *      type: string
 *   responses:
 *    '204':
 *     description: successful operation
 *    '404':
 *     description: No user found with the given credentials
 *    '403':
 *     description: Forbidden
 *    '500':
 *     description: Internal server error. Can't delete user!
 */
router.delete("/:id", verify_token, async (req, res) => {
  if (req.user._id != req.params.id) {
    return res.status(403).send("Forbidden");
  }
  const user = await User.findOne({ _id: req.params.id });
  if (!user) return res.status(404).send("User doesn't exist");
  try {
    await cloudinary.uploader.destroy(user.cloudinary_id);
    await User.deleteOne({ _id: req.params.id });
    res.status(204).send("User deleted succesfully!");
  } catch (e) {
    res.status(400).send("Error while deleting");
  }
});

module.exports = router;
