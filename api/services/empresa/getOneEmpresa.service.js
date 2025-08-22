const Empresa = require("../../models/empresa.model");

exports.getOneEmpresaService = async (id) => {
  const result = await Empresa.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!result) {
    throw new Error("No se encontró ninguna empresa");
  }
  return result;
};
