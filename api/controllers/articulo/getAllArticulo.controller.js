const {
  getAllArticuloService,
} = require("../../services/articulo/getAllArticulo.service");

exports.getAllArticuloController = async (req, res) => {
  try {
    const result = await getAllArticuloService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener los artículos:", error.message);
    return res.status(500).json({
      error: "Ocurrió un error al obtener los artículos",
    });
  }
};
