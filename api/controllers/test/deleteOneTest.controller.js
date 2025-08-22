const {
  deleteOneTestService,
} = require("../../services/test/deleteOneTest.service");

exports.deleteOneTestController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTest = await deleteOneTestService(id);
    if (!deletedTest) {
      return res.status(404).json({ message: "Test no encontrado" });
    }
    res.json({ message: "Test eliminado correctamente", deletedTest });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al eliminar el test", error: error.message });
  }
};
