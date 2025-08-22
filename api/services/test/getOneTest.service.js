const Test = require("../../models/test.model");

exports.getOneTestService = async (id) => {
  if (!id) throw new Error("No se ha proporcionado el ID");

  const result = await Test.findOne({
    _id: id,
    isDeleted: { $ne: true },
  }).populate("logros");

  if (!result)
    throw new Error("No se pudo obtener el test de la base de datos");

  return result;
};
