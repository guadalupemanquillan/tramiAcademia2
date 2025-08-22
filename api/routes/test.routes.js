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

// POST
testRouter.post("/", authorizeRoles('editor'), createNewTestController);
testRouter.post("/verificarTest/:userId/:testId",verificarTestController)
// DELETE
testRouter.delete("/:id", authorizeRoles('editor'), deleteOneTestController);
// GET
testRouter.get("/", getAllTestController);
testRouter.get("/:id", getOneTestController);
// PUT
testRouter.put("/:id", authorizeRoles('editor'), putOneTestController);

module.exports = testRouter;
