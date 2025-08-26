const Tareas = require('../../models/tareas.model');

exports.getAllTareasService = async (filters = {}) => {
  const query = {};
  if (filters.usuarioId) query.usuarioId = filters.usuarioId;
  const tareas = await Tareas.find(query).populate("usuarioId", "nombre");
  return tareas;
};
