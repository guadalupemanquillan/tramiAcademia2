const Empresa = require("../../models/empresa.model");

exports.putOneEmpresaService = async (id, data) => {
  const result = await Empresa.findByIdAndUpdate(id, data, { new: true });
  if (!result) {
    throw new Error("No se encontró la empresa para actualizar");
  }
  return result;
};
