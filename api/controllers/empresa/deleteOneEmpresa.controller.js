const {
  deleteOneEmpresaService,
} = require("../../services/empresa/deleteEmpresa.service");

exports.deleteOneEmpresaController = async (req, res) => {
  const { id } = req.params; 
  try {
    const empresaEliminada = await deleteOneEmpresaService(id);
    return res.status(200).json({
      message: "Empresa eliminada con éxito",
      data: empresaEliminada,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message || "Error al eliminar la empresa",
    });
  }
};
