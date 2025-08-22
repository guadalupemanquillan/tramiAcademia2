const {
  deleteOneArticuloService,
} = require("../../services/articulo/deleteOneArticulo.service");

exports.deleteOneArticuloController=async (req, res) => {
  try {
    const result = await deleteOneArticuloService(req);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al eliminar artículo:", error.message);
    return res.status(400).json({
      error: error.message,
    });
  }
};
