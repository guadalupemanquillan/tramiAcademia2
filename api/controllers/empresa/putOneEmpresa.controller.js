const {
  putOneEmpresaService,
} = require("../../services/empresa/putOneEmpresa.service");

exports.putOneEmpresaController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedEmpresa = await putOneEmpresaService(id, data);

    res.status(200).json(updatedEmpresa);
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      error: error.message,
    });
  }
};
