const express = require("express");
const router = express.Router();
const HardwareController = require("../controller/hardware");

router.get("/history/:hardwareId", HardwareController.hardware_history_get);

router.get("/history", HardwareController.hardware_history_get_all);

router.post("/history", HardwareController.hardware_update_history);

router.post("/history/v2", HardwareController.hardware_update_history_v2);

router.post("/", HardwareController.hardware_update_hardware);

router.post("/v2", HardwareController.hardware_update_hardware_v2);

router.post("/dev/v2", HardwareController.hardware_update_hardware_v2_dev);

router.post("/v3", HardwareController.hardware_update_hardware_v3);

router.post("/v4", HardwareController.hardware_update_hardware_v4);

router.get("/", HardwareController.hardware_get_all);

router.get("/:id", HardwareController.hardware_get);

router.get("/check/:id", HardwareController.hardware_check);

router.get("/delete/:id", HardwareController.hardware_delete);

router.get("/delete_all/yes", HardwareController.hardware_delete_all);

router.post("/updateLatLong", HardwareController.update_lat_long);

module.exports = router;