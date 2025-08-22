const User = require('../../models/user.model');

exports.getOneUserService = async (id) => {
  const user = await User.findById(id);
  return user;
};
 



