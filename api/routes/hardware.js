const express = require("express");
const router = express.Router();
const HardwareController = require("../controller/hardware");

router.post("/", HardwareController.hardware_update_hardware);

module.exports = router;