const { completeTestService } = require("../../services/test/completeTest.service");

exports.completeTestController = async (req, res) => {
  try {
    const { userId, testId } = req.params;
    const { respuestas } = req.body;

    const resultado = await completeTestService({ userId, testId, respuestas });
    return res.status(200).json(resultado);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


