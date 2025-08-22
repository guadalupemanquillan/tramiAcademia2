const {
  getAllLogrosService,
} = require("../../services/logros/getAllLogros.service");

exports.getAllLogrosController = async (req, res) => {
  try {
    const logros = await getAllLogrosService(req);

    return res.status(200).json(logros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Error al obtener los logros",
      details: error.message,
    });
  }
};
