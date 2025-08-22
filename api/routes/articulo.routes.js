const express = require("express");

articuloRouter = express.Router();

const {
  createNewArticuloController,
} = require("../controllers/articulo/createNewArticulo.controller");

const {
  putOneArticuloController,
} = require("../controllers/articulo/putOneArticulo.controller");

const {
  getOneArticuloController,
} = require("../controllers/articulo/getOneArticulo.controller");

const {
  getAllArticuloController,
} = require("../controllers/articulo/getAllArticulo.controller");

const {
  deleteOneArticuloController,
} = require("../controllers/articulo/deleteOneArticulo.controller");

// GET
articuloRouter.get("/:id", getOneArticuloController);
articuloRouter.get("/", getAllArticuloController);

// POST
articuloRouter.post("/", createNewArticuloController);

/// PUT
articuloRouter.put("/:id", putOneArticuloController);

// DELETE
articuloRouter.delete("/:id", deleteOneArticuloController);

module.exports = articuloRouter;
