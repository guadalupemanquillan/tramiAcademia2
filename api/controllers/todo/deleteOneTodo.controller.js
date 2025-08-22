const { deleteTodoService } = require("../../services/todo/delateTodo.service");

exports.deleteOneTodoController = async (req, res) => {
  try {
    const result = await deleteTodoService(req);
    if (!result) {
      return res.status(404).json({ error: "Todo no encontrado" });
    }
    res.status(200).json({ message: "Todo eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
