const { getAllTestService } = require("../../services/test/getAllTest.service");

exports.getAllTestController = async (req, res) => {
  try {
    const role = req.user?.role || 'usuario';
    const tests = await getAllTestService(role);
    res.json({ tests });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener los tests", error: error.message });
  }
};
