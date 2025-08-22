const {
  createNewArticuloService,
} = require("../../services/articulo/createNewArticulo.service");


exports.createNewArticuloController = async (req, res) => {
  try {
    const result = await createNewArticuloService(req);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Error al crear artículo:", error.message);
    return res.status(400).json({
      error: error.message,
    });
  }
};



