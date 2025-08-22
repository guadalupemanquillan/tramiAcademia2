const { getOneArticuloService } = require("../../services/articulo/getOneArticulo.service");

exports.getOneArticuloController = async (req, res) => {
  const { id } = req.params;
  try {
    const articulo = await getOneArticuloService(id);
    if (!articulo) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }
    res.status(200).json(articulo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};