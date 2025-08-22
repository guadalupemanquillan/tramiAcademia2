const mongoose = require("mongoose");

const empresaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    unique: true,
  },
  imagen: {
    type: String,
  },
});

const Empresa = mongoose.model("Empresa", empresaSchema);
module.exports = Empresa;
