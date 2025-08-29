const mongoose = require("mongoose");

const tareasSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tareaCompletada: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Tareas = mongoose.model("Tareas", tareasSchema);

module.exports = Tareas;
