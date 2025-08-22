const Articulo = require("../../models/articulo.model");

exports.getAllArticuloService = async () => {
  const articulos = await Articulo.find().populate("categoriaId", "nombre"); 
  return articulos;
}




