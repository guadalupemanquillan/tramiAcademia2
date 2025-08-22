const { createNewTestService } = require("../../services/test/createNewTest.service");

exports.createNewTestController = async (req, res) => {
  try {
    const test = await createNewTestService(req.body);
    return res.status(201).json({
      message: "Test creado con éxito",
      data: test,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};