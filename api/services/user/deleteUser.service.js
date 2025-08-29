const User = require('../../models/user.model');

exports.deleteUserService = async (id) => {
  const deletedUser = await User.findByIdAndDelete(id);
  
  if (!deletedUser) {
    throw new Error('Usuario no encontrado');
  }
  
  return deletedUser;
};
 
