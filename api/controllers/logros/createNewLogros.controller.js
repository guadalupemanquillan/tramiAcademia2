const {
  createNewLogrosService,
} = require("../../services/logros/createNewLogros.service");

exports.createNewLogrosController = async (req, res) => {
  try {
    const result = await createNewLogrosService(req);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear logro:", error.message);
    return res.status(400).json({ error: error.message });
  }
};
