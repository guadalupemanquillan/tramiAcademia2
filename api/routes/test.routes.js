const express = require("express");

const testRouter = express.Router();

const { authorizeRoles } = require("../middlewares/roles.middleware");
const { createNewTestController } = require("../controllers/test/createNewTest.controller");

const {
  deleteOneTestController,
} = require("../controllers/test/deleteOneTest.controller");

const {
  getAllTestController,
} = require("../controllers/test/getAllTest.controller");

const {
  getOneTestController,
} = require("../controllers/test/getOneTest.controller");

const {
  putOneTestController,
} = require("../controllers/test/putOneTest.controller");

const {
  verificarTestController,
} = require("../controllers/test/verificarTest.controller");

const {
  checkTestDisponibilidadController,
} = require("../controllers/test/checkTestDisponibilidad.controller");

const {
  completeTestController,
} = require("../controllers/test/completeTest.controller");

// POST
testRouter.post("/", authorizeRoles('editor'), createNewTestController);
testRouter.post("/verificarTest/:userId/:testId",verificarTestController)
// Disponibilidad del test para un usuario
testRouter.get("/:testId/disponible", checkTestDisponibilidadController);
// Completar test (aprobado/logros/tarea)
testRouter.post("/complete/:userId/:testId", completeTestController);
// DELETE
testRouter.delete("/:id", authorizeRoles('editor'), deleteOneTestController);
// GET
testRouter.get("/", getAllTestController);
testRouter.get("/:id", getOneTestController);
// PUT
testRouter.put("/:id", authorizeRoles('editor'), putOneTestController);

module.exports = testRouter;
