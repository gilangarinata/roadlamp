const express = require("express");
const router = express.Router();
const HardwareController = require("../controller/hardware");

router.post("/", HardwareController.hardware_update_hardware);

router.get("/", HardwareController.hardware_get_all);

router.get("/:id", HardwareController.hardware_get);

router.get("/check/:id", HardwareController.hardware_check);

module.exports = router;