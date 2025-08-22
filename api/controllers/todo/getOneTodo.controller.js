const { getOneTodoService } = require("../../services/todo/getOneTodo.service");

exports.getOneTodoController = async (req, res) => {
  try {
    const result = await getOneTodoService(req);
    if (!result) {
      return res.status(404).json({ error: "Todo no encontrado" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
