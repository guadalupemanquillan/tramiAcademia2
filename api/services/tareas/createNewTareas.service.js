const Tareas = require("../../models/tareas.model");

exports.createNewTareasService = async (data) => {
  const newTarea = new Tareas(data);
  await newTarea.save();
  return newTarea;
};
