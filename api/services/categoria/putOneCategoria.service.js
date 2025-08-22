const Categoria = require("../../models/categoria.model")

exports.putOneCategoriaService = async (id, datosActualizados) => {
  const categoriaActualizada = await Categoria.findByIdAndUpdate(
    id,
    datosActualizados,
    { new: true }
  );

  if (!categoriaActualizada) {
    throw new Error("Categoría no encontrada");
  }

  return categoriaActualizada;
};


