const User = require('../../models/user.model');

exports.putOneUserService = async (id, data) => {
  const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
  return updatedUser;
};