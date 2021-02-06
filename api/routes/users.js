const express = require("express");
const router = express.Router();
const UsersController = require("../controller/users");

router.get("/", UsersController.show_all);

router.post("/signup", UsersController.users_signup);

router.post("/add_superuser_1", UsersController.super_user_1_signup);

router.post("/login", UsersController.users_login);

router.delete("/:userId", UsersController.users_delete);

router.get("/deleteall/:key", UsersController.delete_all);

router.get("/delete_all", UsersController.users_delete_all);

router.get("/getUserReferal/:referal", UsersController.users_get_referal);

router.get("/getGoverment/:query", UsersController.users_get_goverment);

router.get("/getAllUserAdmin/:query", UsersController.get_all_user_admin);

router.get("/addReferalFrom/:userId/:referal", UsersController.add_referal_from);

module.exports = router;