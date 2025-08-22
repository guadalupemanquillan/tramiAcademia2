const { putOneTestService } = require('../../services/test/putOneTest.service');

exports.putOneTestController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedTest = await putOneTestService(id, updatedData);
    if (!updatedTest) {
      return res.status(404).json({ message: "Test no encontrado" });
    }
    res.json({ message: "Test actualizado correctamente", updatedTest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el test", error: error.message });
  }
};
 