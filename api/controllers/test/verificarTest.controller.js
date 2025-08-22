const {
  verificarTestService,
} = require("../../services/test/verificarTest.service");

exports.verificarTestController = async (req, res) => {
  try {
    const { userId, testId } = req.params;

    const { respuestas } = req.body;

    const resultado = await verificarTestService({
      userId,
      testId,
      respuestas,
    });

    return res.status(200).json({
      resultado
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
