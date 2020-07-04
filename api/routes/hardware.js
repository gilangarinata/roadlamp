const express = require("express");
const router = express.Router();
const HardwareController = require("../controller/hardware");

router.get("/history/:date", HardwareController.hardware_history_get);

router.get("/history", HardwareController.hardware_history_get_all);

router.post("/history", HardwareController.hardware_update_history);

router.post("/", HardwareController.hardware_update_hardware);

router.get("/", HardwareController.hardware_get_all);

router.get("/:id", HardwareController.hardware_get);

router.get("/check/:id", HardwareController.hardware_check);

router.get("/delete/:id", HardwareController.hardware_delete);

module.exports = router;