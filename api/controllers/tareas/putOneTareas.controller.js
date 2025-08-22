const {
  putOneTareasService,
} = require("../../services/tareas/putOneTareas.service");

exports.putOneTareasController = async (req, res) => {
  try {
    const { id } = req.params;
    const tareaData = req.body;
    const updatedTarea = await putOneTareasService(id, tareaData);

    if (!updatedTarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json.updatedTarea;
  } catch (error) {
    console.error(error);
    res.status(500).json.error.message;
  }
};
