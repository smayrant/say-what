const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

router.get("/", userController.home);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

// post routes
router.get('/create-post', userController.routeProtection, postController.viewCreateScreen)

router.post('/create-post', userController.routeProtection, postController.create)

module.exports = router;
