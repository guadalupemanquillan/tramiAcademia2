const Logros = require("../../models/logros.model");

exports.putOneLogrosService = async (id, data) => {
  const logroActualizado = await Logros.findByIdAndUpdate(id, data, {
    new: true,
  });
  return logroActualizado;
};
