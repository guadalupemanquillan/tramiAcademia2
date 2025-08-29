const User = require('../../models/user.model');

exports.getOneUserService = async (id) => {
  const user = await User.findById(id)
    .populate('empresaId', 'nombre')
    .populate({
      path: 'logros',
      match: { isDeleted: { $ne: true } }
    });
  
  // Obtener las categorías de la empresa del usuario
  if (user && user.empresaId && user.empresaId._id) {
    const Categoria = require('../../models/categoria.model');
    
    // Buscar categorías específicas de la empresa
    const categorias = await Categoria.find({ 
      empresaId: user.empresaId._id,
      isDeleted: { $ne: true }
    }).select('nombre');
    
    // Agregar las categorías al objeto del usuario
    // Convertir a objetos planos para evitar problemas de serialización
    user.categoriasEmpresa = categorias.map(cat => ({
      _id: cat._id.toString(),
      nombre: cat.nombre
    }));
  }
  
  // Convertir a objeto plano para asegurar que todas las propiedades se serialicen
  const userPlain = user.toObject ? user.toObject() : user;
  
  // Agregar las categorías después de convertir a objeto plano
  if (user.categoriasEmpresa) {
    userPlain.categoriasEmpresa = user.categoriasEmpresa;
  }
  
  return userPlain;
};
 



