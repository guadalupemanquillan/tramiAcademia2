const Logros = require("../../models/logros.model");

exports.getOneLogrosService = async (id) => {
  const logro = await Logros.findById(id).populate("usuarioId");
  return logro;
};
