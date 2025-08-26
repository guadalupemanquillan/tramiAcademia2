const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  titulo: {
    type: String,
  },
  tareasBase: [
    {
      nombreTarea: {
        type: String
      }
    }
  ],
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
  },
  activo: {
    type: Boolean,
    default: true
  }
});

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
