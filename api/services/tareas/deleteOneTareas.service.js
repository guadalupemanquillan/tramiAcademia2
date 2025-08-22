const Tareas = require('../../models/tareas.model');

exports.deleteOneTareasService = async (id) => {
  const deletedTarea = await Tareas.findByIdAndDelete(id);
  return deletedTarea;
};



