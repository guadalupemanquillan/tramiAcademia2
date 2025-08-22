const Categoria = require("../../models/categoria.model");
const Articulo = require("../../models/articulo.model");

exports.createNewArticuloService = async (req) => {
  const { titulo, texto, autor, categoriaId } = req.body;

  if (!titulo || !texto || !autor || !categoriaId) {
    throw new Error("Faltan campos obligatorios");
  }

  const categoriaExiste = await Categoria.findById(categoriaId);
  if (!categoriaExiste) {
    throw new Error("La categoría no existe");
  }

  const nuevoArticulo = await Articulo.create({
    titulo,
    texto,
    autor,
    categoriaId,
  });

  return nuevoArticulo;
};
