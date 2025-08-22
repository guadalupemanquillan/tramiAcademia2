const Logros = require("../../models/logros.model");

exports.getAllLogrosService = async (req) => {
  // Evitar fallos de cast si existen documentos con usuarioId inválido
  const logros = await Logros.find({ isDeleted: { $ne: true } });
  return logros;
};
