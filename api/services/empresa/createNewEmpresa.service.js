const Empresa = require("../../models/empresa.model");

exports.createNewEmpresaService = async (req, res) => {
  if (!req.body) throw new Error("No se puede enviar el body vacío");
  const { nombre, imagen } = req.body;

  if (!nombre || !imagen)
    throw new Error("Campos obligatorios no proporcioandos");

  const empresaExiste = await Empresa.findOne({ nombre: nombre.trim()});
  if(empresaExiste) {
    throw new Error("Ya existe una empresa con ese nombre");
  }

  const nuevaEmpresa = await Empresa.create({ nombre, imagen });

  return nuevaEmpresa;
};
