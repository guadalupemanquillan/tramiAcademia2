const User = require('../../models/user.model');

exports.getAllUserService = async () => {
  const users = await User.find(); 
  return users;
};


