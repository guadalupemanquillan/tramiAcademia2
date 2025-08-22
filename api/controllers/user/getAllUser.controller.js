const { getAllUserService } = require("../../services/user/getAllUser.service");

exports.getAllUserController = async (req, res) => {
  try {
    const users = await getAllUserService();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los usuarios",
      error: error.message,
    });
  }
};
