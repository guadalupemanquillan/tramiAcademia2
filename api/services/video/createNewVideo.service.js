const Video = require("../../models/video.model");

exports.createNewVideoService = async (req) => {
  const { urlYouTube, titulo, categoriaId } = req.body; 

  if (!urlYouTube || !titulo || !categoriaId) {
    throw new Error("Faltan campos obligatorios");
  }

  const newVideo = new Video({ urlYouTube, titulo, categoriaId }); 

  await newVideo.save();

  return newVideo;
};
