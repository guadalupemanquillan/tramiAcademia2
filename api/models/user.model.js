const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
  },
  nombreCompleto: {
    type: String,
  },
  roles: {
    type: String,
    enum: ["usuario", "editor"],
    default: "usuario"
  },
  password: {
    type: String,
  },
  logros: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Logros",
      },
    ]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
