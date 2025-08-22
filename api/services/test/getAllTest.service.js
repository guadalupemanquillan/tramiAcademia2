const Test = require("../../models/test.model");

exports.getAllTestService = async () => {
  return await Test.find({ isDeleted: { $ne: true } }).populate("logros");
};
