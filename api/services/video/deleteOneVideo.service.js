const Video = require("../../models/video.model");

exports.deleteOneVideoService = async (req) => {
  const { id } = req.params;
  const result = await Video.findByIdAndDelete(id);
  if (!result) throw new Error("Error al borrar el video");
  return result; 
};


