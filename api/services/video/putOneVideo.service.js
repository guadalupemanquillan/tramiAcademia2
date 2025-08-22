const Video = require("../../models/video.model");

exports.putOneVideoService = async (req) => {
  const { id } = req.params;
  const { urlYouTube, titulo, categoríaId } = req.body;

  const editVideo = await Video.findByIdAndUpdate(
    id,
    { urlYouTube, titulo, categoríaId },
    { new: true, runValidators: true }
  );

  if(!editVideo) throw new Error("Error al editar el video");
  return editVideo
};
 
