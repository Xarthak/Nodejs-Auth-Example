const express = require("express");
const router = express.Router();
const multer = require("multer");

const userController = require("../../../controllers/userControllers.js");
const imageController = require("../../../controllers/imageControllers.js");
const requireLogin = require("../../../middlewares/requireLogin.js");

router.route("/signup").post(userController.signup);

router.route("/login").post(userController.login);

router.route("/test").get(userController.test);

router
  .route("/uploadImage")
  .post(multer().single("file"), imageController.uploadFileToS3New);

router
  .route("/getUserInfo")
  .get(requireLogin.checkIfUserAutenticated, userController.getUserInfo);

module.exports = router;
