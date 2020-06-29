const express = require("express");
const router = express.Router();
const ScheduleController = require("../controller/schedule");

router.get("/deletes/:id", ScheduleController.schedule_delete);

router.get("/:userId/:hardwareId", ScheduleController.schedule_get);

router.post("/edit/:id", ScheduleController.schedule_edit);

router.post("/", ScheduleController.schedule_add);

module.exports = router;