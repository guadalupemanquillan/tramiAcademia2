const {
  getAllVideoService,
} = require("../../services/video/getAllVideo.service");

exports.getAllVideoController = async (req, res) => {
  try {
    const result = await getAllVideoService();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
