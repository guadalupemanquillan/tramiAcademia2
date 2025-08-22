const User = require('../../models/user.model');

exports.deleteUserService = async (id) => {
  const deletedUser = await User.findByIdAndDelete(id);
  ; 
};
 
