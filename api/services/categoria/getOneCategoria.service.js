const Categoria = require("../../models/categoria.model");
const mongoose = require("mongoose");

exports.getOneCategoriaService = async (id) => {
  if (!id) throw new Error("ID de categoría no proporcionado");

  if (!mongoose.isValidObjectId(id)) {
    throw new Error("El ID no es válido");
  }

  const categoria = await Categoria.findOne({ _id: id, isDeleted: false })
    .populate("categoriaPadre")
    .populate("empresaId");

  if (!categoria) {
    throw new Error("Categoría no encontrada");
  }

  return categoria;
};

//chequear no esta trayendo categoria por id 