const { createNewTodoService } = require("../../services/todo/createNewTodo.service");

exports.createNewTodoController = async (req, res) => {
  try {
    const result = await createNewTodoService(req);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};