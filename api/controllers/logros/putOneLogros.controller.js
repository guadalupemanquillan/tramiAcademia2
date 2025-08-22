const {
  putOneLogrosService,
} = require("../../services/logros/putOneLogros.service");

exports.putOneLogrosController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const logroActualizado = await putOneLogrosService(id, data);

    if (!logroActualizado) {
      return res.status(404).json({ message: "Logro no encontrado" });
    }

    res.json(logroActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el logro", error: error.message });
  }
};
