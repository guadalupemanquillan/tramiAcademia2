const Tareas = require('../../models/tareas.model');

exports.getAllTareasService = async () => {
  const tareas = await Tareas.find().populate("usuarioId", "nombre");
  return tareas;
};
