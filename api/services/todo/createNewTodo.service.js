const Todo = require("../../models/todo.model");

exports.createNewTodoService = async (req) => {
  const { titulo, tareasBase, tareaBase, categoriaId } = req.body;
  const resolvedTareasBase = Array.isArray(tareasBase) ? tareasBase : (Array.isArray(tareaBase) ? tareaBase : []);
  const newTodo = new Todo({ titulo, tareasBase: resolvedTareasBase, categoriaId });
  return await newTodo.save();
};
 