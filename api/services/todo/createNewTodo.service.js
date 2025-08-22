const Todo = require("../../models/todo.model");

exports.createNewTodoService = async (req) => {
  const { titulo, tareaBase, categoriaId } = req.body;
  const newTodo = new Todo({ titulo, tareaBase, categoriaId });
  return await newTodo.save();
};
 