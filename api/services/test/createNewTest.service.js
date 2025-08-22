const Test = require("../../models/test.model");

exports.createNewTestService = async (data) => {
  if (!data.preguntas || data.preguntas.length === 0) {
    throw new Error("El test debe tener al menos una pregunta");
  }

  if (data.preguntas.length > 10) {
    throw new Error("El test no puede tener más de 10 preguntas");
  }

  const newTest = await Test.create(data);
  return newTest;
};
