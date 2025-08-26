const User = require("../../models/user.model");
const Test = require("../../models/test.model");

// Determina si un usuario puede realizar un test según los logros asociados
exports.checkTestDisponibilidadService = async ({ userId, testId }) => {
  if (!userId) throw new Error("userId es requerido");
  if (!testId) throw new Error("testId es requerido");

  const user = await User.findById(userId).populate("logros");
  if (!user) throw new Error("Usuario no encontrado");

  const test = await Test.findById(testId);
  if (!test) throw new Error("Test no encontrado");

  const nombresLogrosUsuario = new Set(
    (user.logros || []).map((l) => (l && l.nombre ? l.nombre.toLowerCase() : ""))
  );

  const logrosDelTest = Array.isArray(test.logros) ? test.logros : [];
  const tieneAlguno = logrosDelTest.some((logro) => {
    const nombre = logro && logro.nombre ? logro.nombre.trim().toLowerCase() : "";
    if (!nombre) return false;
    return nombresLogrosUsuario.has(nombre);
  });

  return {
    testId: String(test._id),
    disponible: !tieneAlguno,
    reason: tieneAlguno
      ? "Ya completaste este test"
      : "Disponible para realizar",
  };
};


