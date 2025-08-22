const express = require("express");
const empresaRouter = express.Router();
const { authorizeRoles } = require("../middlewares/roles.middleware");
const { createNewEmpresaController } = require("../controllers/empresa/createNewEmpresa.controller");
const {
  putOneEmpresaController,
} = require("../controllers/empresa/putOneEmpresa.controller");
const {
  getOneEmpresaController,
} = require("../controllers/empresa/getOneEmpresa.controller");
const {
  getAllEmpresaController,
} = require("../controllers/empresa/getAllEmpresa.controller");
const {
  deleteOneEmpresaController,
} = require("../controllers/empresa/deleteOneEmpresa.controller");

// GET
empresaRouter.get("/:id", getOneEmpresaController);
empresaRouter.get("/", getAllEmpresaController);

// POST
empresaRouter.post("/", authorizeRoles('editor'), createNewEmpresaController);

// PUT
empresaRouter.put("/:id", authorizeRoles('editor'), putOneEmpresaController);

// DELETE
empresaRouter.delete("/:id", authorizeRoles('editor'), deleteOneEmpresaController);

module.exports = empresaRouter;
