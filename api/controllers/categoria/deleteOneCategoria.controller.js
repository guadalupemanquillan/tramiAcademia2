const {
  deleteOneCategoriaService,
} = require("../../services/categoria/deleteOneCategoria.service");

exports.deleteOneCategoriaController = async (req, res) => {
  try {
    const result = await deleteOneCategoriaService(req);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

