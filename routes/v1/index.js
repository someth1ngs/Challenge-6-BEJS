const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;
const { image } = require("../../libs/multer.js");


// Restrict for Authenticate (jika gamau repot login, gausah, hapus aja)
let restrict = (req, res, next) => {
  let { authorization } = req.headers;
  if (!authorization || !authorization.split(" ")[1]) {
    res.status(400).json({
      status: false,
      message: "Token not provided",
      data: null,
    });
  }

  let token = authorization.split(" ")[1];
  jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
    if (err) {
      res.status(401).json({
        status: false,
        message: err.message,
        data: null,
      });
    }
    delete user.iat;
    req.user = user;
  });
  next();
};

// Required Controller
const userController = require("../../controller/v1/userController.js");

// API Users //
router.post("/api/v1/users", userController.register);
router.get("/api/v1/users",  userController.index);
router.put("/api/v1/users/:id", restrict, image.single("file"), userController.update);

// LOGIN AND AUTH API
router.post("/api/v1/auth/login", userController.login);
router.get("/api/v1/auth/authenticate", restrict, userController.auth);

module.exports = router;
