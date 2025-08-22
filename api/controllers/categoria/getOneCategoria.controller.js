const {
  getOneCategoriaService,
} = require("../../services/categoria/getOneCategoria.service");

exports.getOneCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await getOneCategoriaService(id);
    res.status(200).json(categoria);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
