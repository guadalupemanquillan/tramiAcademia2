const {
  getAllCategoriaService,
} = require("../../services/categoria/getAllCategoria.service");

exports.getAllCategoriasController = async (req, res) => {
  try {
    const { page, limit, nombre } = req.query;
    const result = await getAllCategoriaService({ page, limit, nombre });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
