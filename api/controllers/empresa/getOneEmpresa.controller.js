const {
  getOneEmpresaService,
} = require("../../services/empresa/getOneEmpresa.service");

exports.getOneEmpresaController = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await getOneEmpresaService(id);
    res.json(empresa);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener empresa", error: error.message });
  }
};
