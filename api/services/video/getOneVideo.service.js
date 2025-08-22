const Video = require("../../models/video.model");

exports.getOneVideoService = async (id) => {
  const video = await Video.findById(id);
  if(!video) throw new Error("No se ha encontrado un video con el id proporcionado");
  return video;
};
