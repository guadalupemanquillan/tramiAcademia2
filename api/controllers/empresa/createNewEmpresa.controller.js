const {
  createNewEmpresaService,
} = require("../../services/empresa/createNewEmpresa.service");

exports.createNewEmpresaController = async (req, res) => {
  try {
    const result = await createNewEmpresaService(req);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
