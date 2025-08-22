const express = require("express");
const videoRouter = express.Router();

const {
  createNewVideoController,
} = require("../controllers/video/createNewVideo.controller");

const {
  deleteOneVideoController,
} = require("../controllers/video/deleteOneVideo.controller");

const {
  putOneVideoController,
} = require("../controllers/video/putOneVideo.controller");

const {
  getOneVideoController,
} = require("../controllers/video/getOneVideo.controller");

const {
  getAllVideoController,
} = require("../controllers/video/getAllVideo.controller");

// GET
videoRouter.get("/:id", getOneVideoController);
videoRouter.get("/", getAllVideoController);

// POST
videoRouter.post("/", createNewVideoController);

// PUT
videoRouter.put("/:id", putOneVideoController);

// DELETE
videoRouter.delete("/:id", deleteOneVideoController);

module.exports = videoRouter;
