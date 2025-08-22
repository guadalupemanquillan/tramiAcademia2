const bcrypt = require("bcrypt");
const User = require("../../models/user.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.loginService = async (req, res) => {
  const { username, password } = req.body;
 
  if (!username || !password) {
    throw new Error("Campos requeridos no entregados.");
  }
 
  //const backupUser = process.env.BACKUP_USER;
  //const backupPass = process.env.BACKUP_PASSWORD;

  const usuarioDB = await User.findOne({ nombre: username });
  
  if (usuarioDB) {
    const isMatch = await bcrypt.compare(password, usuarioDB.password);
    if (!isMatch) {
      throw new Error("Contraseña es incorrecta.");
    }
    
    const token = jwt.sign(
      { id: usuarioDB._id, role: usuarioDB.roles },
      process.env.SECRET_KEY,
      { expiresIn: "12h" }
    );

    return { token };
  }
   
  // if (username === backupUser && password === backupPass) {
  //   const token = jwt.sign(
  //     { id: "admin", role: "editor" },
  //     process.env.SECRET_KEY,
  //     { expiresIn: "12h" }
  //   );
  //   return { token };
  // }

  throw new Error("Credenciales incorrectas");
};
