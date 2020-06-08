const express = require("express");
const router = express.Router();
const DevicesController = require("../controller/devices");
const checkAuth = require("../middleware/check-auth");

router.get("/:userId", checkAuth, DevicesController.devices_get);

router.post("/", checkAuth, DevicesController.device_add);

router.delete("/:deviceId", checkAuth, DevicesController.devices_delete);

router.post("/update_lamp", checkAuth, DevicesController.devices_set_lamp);

module.exports = router;