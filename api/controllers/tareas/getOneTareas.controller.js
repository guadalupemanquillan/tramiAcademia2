const { getOneTareasService } = require('../../services/tareas/getOneTareas.service');

exports.getOneTareasController = async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await getOneTareasService(id);

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la tarea', error: error.message });
  }
};
