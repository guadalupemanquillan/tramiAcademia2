const { deleteOneVideoService } = require("../../services/video/deleteOneVideo.service");

exports.deleteOneVideoController = async (req, res) => {
  try {
    const result = await deleteOneVideoService(req);
    if (!result) {
      return res.status(404).json({ error: "Video no encontrado" });
    }
    res.status(200).json({ message: "Video eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
