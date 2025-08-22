const Categoria = require("../../models/categoria.model");

exports.getAllCategoriaService = async (query = {}) => {
  const { page = 1, limit = 10, nombre } = query;

  const filter = { isDeleted: { $ne: true } };
  if (nombre) {
    filter.nombre = { $regex: new RegExp(nombre, "i") };
  }

  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 10;

  const [items, total] = await Promise.all([
    Categoria.find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Categoria.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pageNumber,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
};
