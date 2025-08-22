const { loginService } = require("../../services/auth/login.service");

exports.loginController = async (req, res) => {
  try {
    const result = await loginService(req);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
