const { getOneUserService } = require("../../services/user/getOneUser.service");

exports.getOneUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getOneUserService(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el usuario",
      error: error.message,
    });
  }
};
