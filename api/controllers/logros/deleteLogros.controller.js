const {
  deleteLogrosService,
} = require('../../services/logros/deleteLogros.service');

exports.deleteLogrosController = async (req, res) => {
  try {
    const resultado = await deleteLogrosService(req);

    if (!resultado) {
      return res.status(404).json({
        message: 'Logro no encontrado',
      });
    }

    return res.status(200).json({
      message: 'Logro eliminado con éxito',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error al eliminar el logro',
      details: error.message,
    });
  }
};