const Articulo = require("../../models/articulo.model");

exports.putOneArticuloService = async (id, datosActualizados) => {
  const articuloActualizado = await Articulo.findByIdAndUpdate(
    id,
    datosActualizados,
    {
      new: true,
      runValidators: true,
    }
  )
  if (!articuloActualizado) {
    throw new Error("Artículo no encontrado");
  }
  return articuloActualizado;
};
 
