const express = require("express");
const router = express.Router();
const UsersController = require("../controller/users");

router.get("/", UsersController.show_all);

router.post("/signup", UsersController.users_signup);

router.post("/login", UsersController.users_login);

router.delete("/:userId", UsersController.users_delete);

router.get("/deleteall/:key", UsersController.delete_all);

module.exports = router;