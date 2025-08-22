const Todo = require("../../models/todo.model");

exports.putOneTodoService = async (req) => {
  const { id } = req.params;
  const { titulo, tareaBase, categoriaId } = req.body;

  return await Todo.findByIdAndUpdate(
    id,
    { titulo, tareaBase, categoriaId },
    { new: true, runValidators: true }
  );
};
 