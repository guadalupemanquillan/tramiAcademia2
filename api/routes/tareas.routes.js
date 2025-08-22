const express = require("express");

const tareasRouter = express.Router();

const {
  createNewTareasController,
} = require("../controllers/tareas/createNewTareas.controller");

const {
  putOneTareasController,
} = require("../controllers/tareas/putOneTareas.controller");

const {
  getOneTareasController,
} = require("../controllers/tareas/getOneTareas.controller");

const {
  getAllTareasController,
} = require("../controllers/tareas/getAllTareas.controller");

const {
  deleteOneTareasController,
} = require("../controllers/tareas/deleteOneTareas.controller");

// POST
tareasRouter.post("/", createNewTareasController);

// GET
tareasRouter.get("/:id", getOneTareasController);
tareasRouter.get("/", getAllTareasController);

// PUT
tareasRouter.put("/:id", putOneTareasController);

// DELETE
tareasRouter.delete("/:id", deleteOneTareasController);

module.exports = tareasRouter;
