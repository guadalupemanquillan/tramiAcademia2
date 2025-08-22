const Tareas = require('../../models/tareas.model');

exports.putOneTareasService = async (id, tareaData) => {
  try {
    const updatedTarea = await Tareas.findByIdAndUpdate(id, tareaData, { new: true });
    return updatedTarea;
  } catch (error) {
    throw error;
  }
};
