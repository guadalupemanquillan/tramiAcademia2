const Empresa = require("../../models/empresa.model");

exports.deleteOneEmpresaService = async (id) => {
  const empresaEliminada = await Empresa.findByIdAndDelete(id);
  if (!empresaEliminada) {
    throw new Error("No se encontró la empresa a eliminar");
  }
  return empresaEliminada;
};
