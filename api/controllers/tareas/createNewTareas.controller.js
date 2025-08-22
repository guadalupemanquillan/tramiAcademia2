const {
  createNewTareasService,
} = require("../../services/tareas/createNewTareas.service");

exports.createNewTareasController = async (req, res) => {
  try {
    const data = req.body;
    const newTarea = await createNewTareasService(data);
    res.status(201).json(newTarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear la tarea",
      error: error.message,
    });
  }
};
