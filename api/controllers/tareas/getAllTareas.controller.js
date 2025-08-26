const {
  getAllTareasService,
} = require("../../services/tareas/getAllTareas.service");

exports.getAllTareasController = async (req, res) => {
  try {
    const { usuarioId } = req.query || {};
    const tareas = await getAllTareasService({ usuarioId });
    res.json(tareas);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener las tareas",
      error: error.message,
    });
  }
};
