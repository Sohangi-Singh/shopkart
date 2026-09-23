const express = require("express");
const { register, login, me, logout } = require("../controllers/customer.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);

module.exports = router;
