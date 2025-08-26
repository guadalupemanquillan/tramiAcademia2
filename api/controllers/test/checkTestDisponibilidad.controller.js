const { checkTestDisponibilidadService } = require("../../services/test/checkTestDisponibilidad.service");

exports.checkTestDisponibilidadController = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.query.userId || (req.user && req.user.id);

    const result = await checkTestDisponibilidadService({ userId, testId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


