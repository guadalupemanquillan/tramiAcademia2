const User = require('../../models/user.model');

exports.getAllUserService = async () => {
  const users = await User.find()
    .populate('empresaId', 'nombre')
    .populate({
      path: 'logros',
      match: { isDeleted: { $ne: true } }
    })
    .exec();
  
  // Obtener las categorías de cada empresa para cada usuario
  const usersWithCategories = await Promise.all(users.map(async (user) => {
    if (user.empresaId && user.empresaId._id) {
      const Categoria = require('../../models/categoria.model');
      const categorias = await Categoria.find({ 
        empresaId: user.empresaId._id,
        isDeleted: { $ne: true }
      }).select('nombre');
      
      // Agregar las categorías al objeto del usuario
      user.categoriasEmpresa = categorias;
    }
    return user;
  }));
  
  return usersWithCategories;
};


