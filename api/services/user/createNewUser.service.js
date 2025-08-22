const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

exports.createNewUserService = async (req) => {
  const { nombre, nombreCompleto, roles, password } = req.body;

  if (!nombre && !nombreCompleto) {
    throw new Error("Nombre y nombre completo son requeridos");
  }

  if (!password) {
    throw new Error("La contraseña es requerida");
  }

  const existingUser = await User.findOne({ nombre });
    if (existingUser) {
    throw new Error("Ya existe un usuario con el mismo nombre");
  }

  const saltRounds = 10;
  const encryptedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new User({ ...req.body, password: encryptedPassword });

  const savedUser = await newUser.save();
  return savedUser;
};
