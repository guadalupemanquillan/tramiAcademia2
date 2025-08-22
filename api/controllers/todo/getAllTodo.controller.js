const { getAllTodoService } = require("../../services/todo/getAllTodo.service");


exports.getAllTodoController = async (req, res) => {
  try {
    const result = await getAllTodoService();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
