const Empresa = require("../../models/empresa.model");

exports.getAllEmpresaService = async () => {
  const result = await Empresa.find({ isDeleted: { $ne: true } });
  if (!result || result.length === 0) {
    throw new Error("No se encontraron empresas");
  }
  return result;
};
