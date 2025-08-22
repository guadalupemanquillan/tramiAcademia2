const {
  putOneCategoriaService,
} = require("../../services/categoria/putOneCategoria.service");

exports.putOneCategoriaController = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const categoria = await putOneCategoriaService(id, datosActualizados);

    return res.status(200).json(categoria);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
