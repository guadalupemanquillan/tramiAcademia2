const Articulo = require("../../models/articulo.model");

exports.getOneArticuloService = async (id) => {
    const articulo = await Articulo.findById(id).populate("categoriaId");
    if(!articulo) throw new Error("No se ha encontrado un articulo con el ID proporcionado");

    return articulo;
};
