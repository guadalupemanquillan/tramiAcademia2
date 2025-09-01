const User = require("../../models/user.model");
const bcrypt = require("bcrypt");

exports.createNewUserService = async (req) => {
  const { nombre, nombreCompleto, roles, password, empresaId } = req.body;

  const nombreTrim = typeof nombre === 'string' ? nombre.trim() : '';
  const nombreCompletoTrim = typeof nombreCompleto === 'string' ? nombreCompleto.trim() : '';

  if (!nombreTrim && !nombreCompletoTrim) {
    const err = new Error("Debe indicar nombre o nombre completo");
    err.statusCode = 400;
    throw err;
  }

  if (!password) {
    const err = new Error("La contraseña es requerida");
    err.statusCode = 400;
    throw err;
  }

  if (!empresaId) {
    const err = new Error("La empresa es requerida");
    err.statusCode = 400;
    throw err;
  }

  // Verificación de duplicados solo cuando el campo relevante está presente
  if (nombreTrim) {
    const existingByNombre = await User.findOne({ nombre: nombreTrim });
    if (existingByNombre) {
      const err = new Error("Ya existe un usuario con el mismo nombre");
      err.statusCode = 400;
      throw err;
    }
  } else if (nombreCompletoTrim) {
    const existingByNombreCompleto = await User.findOne({ nombreCompleto: nombreCompletoTrim });
    if (existingByNombreCompleto) {
      const err = new Error("Ya existe un usuario con el mismo nombre completo");
      err.statusCode = 400;
      throw err;
    }
  }

  const saltRounds = 10;
  const encryptedPassword = await bcrypt.hash(password, saltRounds);

  const userDoc = new User({
    nombre: nombreTrim || undefined,
    nombreCompleto: nombreCompletoTrim || undefined,
    roles: roles === 'editor' ? 'editor' : 'usuario',
    empresaId: empresaId,
    password: encryptedPassword,
  });

  const savedUser = await userDoc.save();
  return savedUser;
};
