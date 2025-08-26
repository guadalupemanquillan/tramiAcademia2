const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  nombre: {
    type: String,
  },
  preguntas: [
    {
      tituloPregunta: {
        type: String,
        required: true,
      },
      opcionesRespuesta: [
        {
          type: String,
        },
      ],
      respuestaCorrecta: {
        type: String,
        required: true,
      },
    },
  ],
  logros: [
    {
      nombre: String,
      iconoUrl: String,
    }
  ],
  isDeleted: {
    type: Boolean,
    default: false
  }
});

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
