const Test = require("../../models/test.model");

exports.getAllTestService = async (role = 'usuario') => {
  const query = role === 'editor' ? {} : { isDeleted: { $ne: true } };
  const tests = await Test.find(query).populate("logros");
  return tests;
};
