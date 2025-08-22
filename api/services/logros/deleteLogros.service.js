const Logros = require("../../models/logros.model");

exports.deleteLogrosService = async (req) => {
  const { id } = req.params;

  const logroEliminado = await Logros.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return logroEliminado;
}
    