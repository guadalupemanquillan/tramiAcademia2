const Categoria = require("../../models/categoria.model");

exports.deleteOneCategoriaService = async (req) => {
  const { id } = req.params;

  if (!id) throw new Error("ID de categoría no proporcionado");

  const categoria = await Categoria.findById(id);
  if (!categoria) throw new Error("Categoría no encontrada");
  
  categoria.isDeleted = true;
  await categoria.save()

  return categoria;
};
