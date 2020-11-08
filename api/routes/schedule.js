const express = require("express");
const router = express.Router();
const ScheduleController = require("../controller/schedule");

router.get("/deleteall/:key", ScheduleController.schedule_delete_all);

router.get("/deletes/:id", ScheduleController.schedule_delete);

router.get("/get_by_device/:hardwareId", ScheduleController.schedule_get_by_device);

router.get("/:userId/:hardwareId", ScheduleController.schedule_get);

router.post("/edit/:id", ScheduleController.schedule_edit);

router.post("/", ScheduleController.schedule_add);

module.exports = router;