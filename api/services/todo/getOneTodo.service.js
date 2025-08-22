const Todo = require("../../models/todo.model");

exports.getOneTodoService = async (req) => {
  const { id } = req.params;
  return await Todo.findById(id).populate("categoriaId");
};
