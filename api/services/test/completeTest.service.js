// se encarga de procesar la finalización de un test por un usuario,
// evaluar si lo aprobó,
// asignar logros y registrar la acción en tareas

const User = require("../../models/user.model");
const Logros = require("../../models/logros.model");
const Test = require("../../models/test.model");
const Tareas = require("../../models/tareas.model");

exports.completeTestService = async ({ userId, testId, respuestas }) => {
  const user = await User.findById(userId).populate("logros");
  if (!user) throw new Error("Usuario no encontrado");

  const test = await Test.findById(testId);
  if (!test) throw new Error("Test no encontrado");

  const totalPreguntas = test.preguntas.length;
  if (totalPreguntas !== respuestas.length)
    throw Error("Preguntas requeridas faltantes");

  const necesariasParaAprobar = Math.ceil(totalPreguntas * 0.8);
  let preguntasCorrectas = 0;
  let preguntasIncorrectas = 0;

  for (const respuestaUsuario of respuestas) {
    const preguntaEnTest = test.preguntas.find(
      (pregunta) => pregunta.tituloPregunta === respuestaUsuario.pregunta
    );
    if (preguntaEnTest) {
      if (preguntaEnTest.respuestaCorrecta === respuestaUsuario.respuesta)
        preguntasCorrectas++;
      else preguntasIncorrectas++;
    }
  }

  const aprobado = preguntasCorrectas >= necesariasParaAprobar;

  // Asignación de logros si aprueba
  let logrosCreados = [];
  if (aprobado && Array.isArray(test.logros) && test.logros.length > 0) {
    const nombresLogrosUsuario = new Set(
      (user.logros || []).map((l) =>
        l && l.nombre ? l.nombre.toLowerCase() : ""
      )
    );
    for (const logroTest of test.logros) {
      const nombreLogro =
        logroTest && logroTest.nombre ? logroTest.nombre.trim() : "";
      if (!nombreLogro) continue;
      const yaTieneLogro = nombresLogrosUsuario.has(nombreLogro.toLowerCase());
      if (!yaTieneLogro) {
        const nuevoLogro = await Logros.create({
          nombre: nombreLogro,
          iconoUrl: logroTest.iconoUrl || undefined,
          usuarioId: user._id,
        });
        user.logros.push(nuevoLogro._id);
        nombresLogrosUsuario.add(nombreLogro.toLowerCase());
        logrosCreados.push(nuevoLogro);
      }
    }
    if (logrosCreados.length > 0) await user.save();
  }

  // Registrar tarea solo si aprobó, con el nombre exacto del test
  try {
    if (aprobado) {
      const nombreTarea = `${test.nombre || "Sin nombre"}`;
      await Tareas.create({
        usuarioId: user._id,
        tareaCompletada: nombreTarea,
      });
    }
  } catch (e) {
    // no bloquear por error de log
  }

  return {
    totalPreguntas,
    necesariasParaAprobar,
    preguntasCorrectas,
    preguntasIncorrectas,
    aprobado,
    message:
      aprobado && logrosCreados.length > 0
        ? "Logros creados y asignados con éxito"
        : aprobado
        ? "Sin nuevos logros para asignar"
        : "Test no aprobado",
    logrosOtorgados: logrosCreados,
  };
};
