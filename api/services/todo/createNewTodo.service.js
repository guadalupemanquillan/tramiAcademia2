const Todo = require("../../models/todo.model");

exports.createNewTodoService = async (req) => {
  const { titulo, tareasBase, tareaBase, categoriaId, activo } = req.body;
  const resolvedTareasBase = Array.isArray(tareasBase) ? tareasBase : (Array.isArray(tareaBase) ? tareaBase : []);
  const newTodo = new Todo({ titulo, tareasBase: resolvedTareasBase, categoriaId, activo });
  return await newTodo.save();
};
 