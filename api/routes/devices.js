const express = require("express");
const router = express.Router();
const DevicesController = require("../controller/devices");
const MediaHandler = require("../tools/media-handler")
const checkAuth = require("../middleware/check-auth");

router.get("/delete_all", DevicesController.devices_delete_all);

router.get("/", DevicesController.devices_get_all);

router.post("/upload", MediaHandler.upload.single('images'), DevicesController.device_add_img);

router.get("/:userId", DevicesController.devices_get_v2);

router.post("/v3", DevicesController.devices_get_v3);

router.post("/", MediaHandler.upload.single('images'), DevicesController.device_add);

router.delete("/upload/:hardwareId", DevicesController.device_delete_img);

router.delete("/:deviceId", DevicesController.devices_delete);

router.post("/update_lamp", DevicesController.devices_set_lamp);

router.post("/update_lamp_web", DevicesController.devices_set_lamp_web);

router.post("/update_brightness", DevicesController.devices_set_brightness);

router.get("/web/:userId", DevicesController.devices_get_web);

router.get("/webmap/:userId", DevicesController.devices_get_web_map);

router.post("/get_earth_value/user", DevicesController.devices_process_earth);

router.post("/streets", DevicesController.devices_get_street);

router.get("/update/segment/:hid/:segment", DevicesController.devices_update_segment);

router.post("/history/monthly", DevicesController.devices_get_kwh_segmented);

module.exports = router;