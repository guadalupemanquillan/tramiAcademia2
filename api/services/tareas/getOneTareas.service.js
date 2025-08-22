const Tareas = require("../../models/tareas.model");

exports.getOneTareasService = async (id) => {
  const tarea = await Tareas.findById(id).populate("usuarioId", "nombre");
  return tarea;
};
