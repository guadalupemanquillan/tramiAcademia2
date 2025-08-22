const express = require("express");

const logrosRouter = express.Router();

const { authorizeRoles } = require("../middlewares/roles.middleware");
const { createNewLogrosController } = require("../controllers/logros/createNewLogros.controller");

const {
  deleteLogrosController,
} = require("../controllers/logros/deleteLogros.controller");

const {
  getAllLogrosController,
} = require("../controllers/logros/getAllLogros.controller");
const {
  getOneLogrosController,
} = require("../controllers/logros/getOneLogros.controller");

const {
  putOneLogrosController,
} = require("../controllers/logros/putOneLogros.controller");

// // POST
logrosRouter.post("/", authorizeRoles('editor'), createNewLogrosController);
// // DELETE
logrosRouter.delete("/:id", authorizeRoles('editor'), deleteLogrosController);

// GET
logrosRouter.get("/", getAllLogrosController);
logrosRouter.get("/:id", getOneLogrosController);

// PUT
logrosRouter.put("/:id", authorizeRoles('editor'), putOneLogrosController);

module.exports = logrosRouter;
