const {
  deleteOneTareasService,
} = require("../../services/tareas/deleteOneTareas.service");

exports.deleteOneTareasController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTarea = await deleteOneTareasService(id);
    if (!deletedTarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al eliminar la tarea",
      error: error.message,
    });
  }
};
