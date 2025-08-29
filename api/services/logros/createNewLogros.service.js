const Logros = require("../../models/logros.model");

// Crea un logro de catálogo (no asignado a ningún usuario).
// Los logros se asignan al usuario únicamente cuando aprueba un test.
exports.createNewLogrosService = async (req) => {
  const { nombre, iconoUrl } = req.body || {};
  if (!nombre || !iconoUrl) {
    throw new Error("Faltan datos requeridos para crear el logro");
  }

  // No asociamos a usuario aquí: queda como plantilla/catálogo
  const nuevoLogro = await Logros.create({ nombre, usuarioId: null, iconoUrl });
  return nuevoLogro;
};
