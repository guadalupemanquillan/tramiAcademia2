const Test = require("../../models/test.model");

exports.createNewTestService = async (data) => {
  if (!data.preguntas || data.preguntas.length === 0) {
    throw new Error("El test debe tener al menos una pregunta");
  }

  if (data.preguntas.length > 10) {
    throw new Error("El test no puede tener más de 10 preguntas");
  }

  // Validar logros si se proporcionan
  if (data.logros && Array.isArray(data.logros)) {
    for (const logro of data.logros) {
      if (!logro.nombre || logro.nombre.trim() === '') {
        throw new Error("Todos los logros deben tener un nombre válido");
      }
    }
  }

  const newTest = await Test.create(data);
  return newTest;
};
