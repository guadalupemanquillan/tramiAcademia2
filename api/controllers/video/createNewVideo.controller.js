const {
  createNewVideoService,
} = require("../../services/video/createNewVideo.service");

exports.createNewVideoController = async (req, res) => {
  try {
    const result = await createNewVideoService(req);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
