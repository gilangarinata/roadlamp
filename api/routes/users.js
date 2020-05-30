const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const process = require("../../nodemon.json");

const User = require("../models/user");

const UsersController = require("../controller/users");

router.post("/signup", UsersController.users_signup);

router.post("/login", UsersController.users_login);

router.delete("/:userId", UsersController.users_delete);

module.exports = router;