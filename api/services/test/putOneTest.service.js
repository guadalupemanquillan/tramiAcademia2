const Test = require("../../models/test.model");

exports.putOneTestService = async (id, updatedData) => {
  if (!id && !updatedData)
    throw new Error("Campos requeridos no proporcionados");
  const result = await Test.findByIdAndUpdate(id, updatedData, { new: true });

  return result;
};
