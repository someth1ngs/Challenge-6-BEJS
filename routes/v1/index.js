const router = require("express").Router();
const swaggerUI = require("swagger-ui-express");
const YAML = require("yaml");
const fs = require("fs");
const path = require("path");
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
const postController = require("../../controller/v1/postController.js");

// Directory Documentation API
const swagger_path = path.resolve(__dirname, "../../api-docs.yaml");
const file = fs.readFileSync(swagger_path, "utf-8");

// API Docs
const swaggerDocument = YAML.parse(file);
router.use(
  "/api/v1/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocument)
);

// API Users //
router.post("/api/v1/users", userController.register);
router.get("/api/v1/users",  userController.index);
router.put("/api/v1/users/:id", restrict, image.single("file"), userController.update);

// LOGIN AND AUTH API
router.post("/api/v1/auth/login", userController.login);
router.get("/api/v1/auth/authenticate", restrict, userController.auth);

// API POST //
router.post("/api/v1/posts", restrict, image.single('file'), postController.store);
router.get("/api/v1/posts", restrict, postController.index);
router.get("/api/v1/posts/:id", restrict, postController.show);
router.put("/api/v1/posts/:id/", restrict, postController.update);
router.delete("/api/v1/posts/:id/", restrict, postController.destroy);

module.exports = router;
