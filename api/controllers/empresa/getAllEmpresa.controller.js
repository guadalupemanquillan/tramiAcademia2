const {
  getAllEmpresaService,
} = require("../../services/empresa/getAllEmpresa.service");

exports.getAllEmpresaController = async (req, res) => {
  try {
    const empresas = await getAllEmpresaService();
    return res.status(200).json(empresas);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error al obtener las empresas",
    });
  }
};
