const Video = require("../../models/video.model");

exports.getAllVideoService = async () => {
  return await Video.find().populate("categoriaId");
};
