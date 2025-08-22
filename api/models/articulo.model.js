const mongoose = require("mongoose");

const articuloSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
    },
    texto: {
      type: String,
    },
    autor: {
      type: String,
    },
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
    },
    historialEdiciones: [{
    titulo: {
      type: String,
    },
    texto: {
      type: String,
    },
    autor: {
      type: String,
    },
    categoriaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
    },
    usuarioEdita: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fechaEdicion: {
      type: Date
    }
    }]
  },
  {
    timestamps: true
  }
);

const Articulo = mongoose.model("Articulo", articuloSchema);

module.exports = Articulo;
