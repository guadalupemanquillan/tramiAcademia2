const Todo = require("../../models/todo.model");

exports.getAllTodoService = async () => {
  return await Todo.find().populate("categoriaId");
};