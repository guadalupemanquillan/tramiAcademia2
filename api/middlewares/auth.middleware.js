const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({ error: "Acceso denegado. Token no proporcionado" });
}


  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token inválido:", error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};
