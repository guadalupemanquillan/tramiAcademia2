const { getAllTestService } = require("../../services/test/getAllTest.service");

exports.getAllTestController = async (req, res) => {
  try {
    const tests = await getAllTestService();
    res.json({ tests });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener los tests", error: error.message });
  }
};
