const {
  getOneVideoService,
} = require("../../services/video/getOneVideo.service");

exports.getOneVideoController = async (req, res) => {
  try {
    const result = await getOneVideoService(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Video no encontrado" });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
