const { putOneUserService } = require("../../services/user/putOneUser.service");

exports.putOneUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedUser = await putOneUserService(id, data);

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};
