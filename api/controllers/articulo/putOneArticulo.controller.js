const {
  putOneArticuloService,
} = require("../../services/articulo/putOneArticulo.service");
exports.putOneArticuloController = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    const articulo = await putOneArticuloService(id, datosActualizados);
    return res.status(200).json(articulo);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};
