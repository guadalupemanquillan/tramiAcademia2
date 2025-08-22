const mongoose = require("mongoose");
const Logros = require("../../models/logros.model");
const User = require("../../models/user.model");

exports.createNewLogrosService = async (req) => {
  const { userId, nombre, iconoUrl } = req.body || {};
  if (!userId || !nombre || !iconoUrl) {
    throw new Error("Faltan datos requeridos para crear el logro");
  }

  let usuarioValido = null;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    try {
      usuarioValido = await User.findById(userId);
    } catch (e) {
      usuarioValido = null;
    }
  }
  // Crear logro aunque el usuario no exista 
  // (ej: login de respaldo con id no-ObjectId), esta hecho solo para pruebas
  const nuevoLogro = await Logros.create({ nombre, usuarioId: usuarioValido?._id || null, iconoUrl });

  if (usuarioValido) {
    if (!Array.isArray(usuarioValido.logros)) {
      usuarioValido.logros = [];
    }
    usuarioValido.logros.push(nuevoLogro._id);
    await usuarioValido.save();
  }

  return nuevoLogro;
};
