const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

router.get("/", userController.home);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

// profile routes
router.get(
	"/profile/:username",
	userController.ifUserExists,
	userController.sharedProfileData,
	userController.profilePostsScreen
);

router.get(
	"/profile/:username/followers",
	userController.ifUserExists,
	userController.sharedProfileData,
	userController.profileFollowersScreen
);

// post routes
router.get("/create-post", userController.routeProtection, postController.viewCreateScreen);

router.post("/create-post", userController.routeProtection, postController.create);

router.get("/post/:id", postController.viewSingle);

router.get("/post/:id/edit", userController.routeProtection, postController.viewEditScreen);

router.post("/post/:id/edit", userController.routeProtection, postController.edit);

router.post("/post/:id/delete", userController.routeProtection, postController.delete);

router.post("/search", postController.search);

// follow routes
router.post("/addFollow/:username", userController.routeProtection, followController.addFollow);

router.post("/removeFollow/:username", userController.routeProtection, followController.removeFollow);

module.exports = router;
