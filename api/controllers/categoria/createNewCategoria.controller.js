const {
  createNewCategoriaService,
} = require("../../services/categoria/createNewCategoria.service");

exports.createNewCategoriaController = async (req, res) => {
  try {
    const result = await createNewCategoriaService(req);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
