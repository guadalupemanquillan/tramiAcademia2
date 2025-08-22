const Todo = require("../../models/todo.model");

exports.deleteTodoService = async (req) => {
  const { id } = req.params;
  return await Todo.findByIdAndDelete(id);
};
