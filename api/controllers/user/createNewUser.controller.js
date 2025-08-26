const {
  createNewUserService,
} = require("../../services/user/createNewUser.service");

exports.createNewUserController = async (req, res) => {
  try {
    const newUser = await createNewUserService(req);
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};
