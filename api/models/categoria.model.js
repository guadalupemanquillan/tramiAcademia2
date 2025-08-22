const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  categoriaPadre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
  },
  jerarquia: {
    type: Number,
    default: 0,
  },
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empresa",
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

const Categoria = mongoose.model("Categoria", categoriaSchema);

module.exports = Categoria;
