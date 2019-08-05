const express = require("express");
const router = express.Router();
const userContoller = require("./controllers/userController");

router.get("/", userContoller.home);

router.post("/register", userContoller.register);

router.post("/login", userContoller.login);

router.post("/logout", userContoller.logout);

module.exports = router;
