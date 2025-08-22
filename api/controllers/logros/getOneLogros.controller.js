const { getOneLogrosService } = require('../../services/logros/getOneLogros.service');

exports.getOneLogrosController = async (req, res) => {
  try {
    const { id } = req.params;
    const logro = await getOneLogrosService(id);
    if (!logro) {
      return res.status(404).json({ message: 'Logro no encontrado' });
    }
    res.json(logro);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener logro', error: error.message });
  }
};