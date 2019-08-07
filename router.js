const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

router.get("/", userController.home);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

// profile routes
router.get("/profile/:username", userController.ifUserExists, userController.profilePostsScreen);

// post routes
router.get("/create-post", userController.routeProtection, postController.viewCreateScreen);

router.post("/create-post", userController.routeProtection, postController.create);

router.get("/post/:id", postController.viewSingle);

router.get("/post/:id/edit", userController.routeProtection, postController.viewEditScreen);

router.post("/post/:id/edit", userController.routeProtection, postController.edit);

module.exports = router;
