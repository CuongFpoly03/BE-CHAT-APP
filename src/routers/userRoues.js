const express = require("express");
const router = express.Router();
const {registerUser, authUser, allUsers} = require("../controllers/userController")
const {protect} = require("../middlewares/authMiddleware")

router.route("/").get(protect, allUsers);
router.route("/").get(protect, registerUser);
router.route("/login").get(protect, authUser);

module.exports = router;