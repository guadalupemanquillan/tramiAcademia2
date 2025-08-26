const Todo = require("../../models/todo.model");

exports.putOneTodoService = async (req) => {
  const { id } = req.params;
  const { titulo, tareasBase, tareaBase, categoriaId, activo } = req.body;

  // Compatibilidad: aceptar tareasBase (correcto) o tareaBase (legacy)
  const resolvedTareasBase = Array.isArray(tareasBase) ? tareasBase : (Array.isArray(tareaBase) ? tareaBase : undefined);

  const update = {
    ...(titulo !== undefined ? { titulo } : {}),
    ...(categoriaId !== undefined ? { categoriaId } : {}),
    ...(resolvedTareasBase !== undefined ? { tareasBase: resolvedTareasBase } : {}),
    ...(activo !== undefined ? { activo } : {}),
  };

  return await Todo.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  );
};
 