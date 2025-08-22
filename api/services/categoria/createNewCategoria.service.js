const Categoria = require("../../models/categoria.model");

exports.createNewCategoriaService = async (req) => {
  if (!req.body) throw new Error("No se puede enviar el body vacío");

  const { nombre, jerarquia, categoriaPadre, empresaId } = req.body;
  if (!nombre) {
    throw new Error("Campos obligatorios no proporcionados");
  }

  const categoriaExiste = await Categoria.findOne({ nombre: nombre });
  if (categoriaExiste) {
    throw new Error("Ya existe una categoría con ese nombre");
  }

  const nuevaCategoria = await Categoria.create({
    nombre: nombre,
    jerarquia: jerarquia,
    categoriaPadre: categoriaPadre,
    empresaId: empresaId
  });

  return nuevaCategoria;
};
