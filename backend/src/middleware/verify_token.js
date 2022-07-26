const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).send("Access Denied");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).send("Invalid Token!");
  }
};
