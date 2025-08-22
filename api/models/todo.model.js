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
});

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;
