const {
  createNewUserService,
} = require("../../services/user/createNewUser.service");

exports.createNewUserController = async (req, res) => {
  try {
    const newUser = await createNewUserService(req);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};
