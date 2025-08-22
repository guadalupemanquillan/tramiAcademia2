const Test = require("../../models/test.model");

exports.deleteOneTestService = async (id) => {
  if (!id) throw new Error("Id no proporcionado");
  const result = await Test.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};
