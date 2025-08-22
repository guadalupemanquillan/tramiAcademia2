const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  urlYouTube: {
    type: String,
  },
  titulo: {
    type: String,
  },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
  },
});

const Video = mongoose.model("Video", videoSchema);
module.exports = Video;
